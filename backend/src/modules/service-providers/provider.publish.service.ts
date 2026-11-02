import { prisma } from '../../config/database';
import {
  ProviderStatus,
  ProviderCategoryStatus,
  ProductStatus,
  ModerationStatus,
} from '@prisma/client';
import {
  serializeProviderPublic,
  serializeProductPublic,
} from './provider.serializer';

export class ProviderPublishService {
  /**
   * Rebuilds the published snapshot for a provider and its products.
   * Public directory reads strictly from PublishedProvider and PublishedProduct.
   */
  async rebuildPublishedProvider(providerId: string) {
    const provider = await prisma.serviceProvider.findUnique({
      where: { id: providerId },
      include: {
        contacts: { where: { isPublic: true } },
        addresses: { where: { isPrivate: false, type: { not: 'REGISTERED' } } },
        socialLinks: true,
        categorySelections: {
          where: { isSelected: true, status: ProviderCategoryStatus.APPROVED },
          include: {
            category: { select: { id: true, number: true, name: true, slug: true } },
            subcategory: { select: { id: true, key: true, label: true } },
          },
        },
        products: {
          where: { status: ProductStatus.APPROVED },
          include: {
            categoryLinks: {
              include: {
                category: { select: { id: true, number: true, name: true, slug: true } },
              },
            },
            categoryDetails: {
              include: {
                category: { select: { id: true, number: true, name: true, slug: true } },
              },
            },
            technicalSpec: true,
            integration: true,
            pricing: true,
            media: { where: { reviewStatus: ModerationStatus.APPROVED } },
            documents: { where: { reviewStatus: ModerationStatus.APPROVED, visibility: 'PUBLIC' } },
          },
        },
        teamMembers: {
          where: { reviewStatus: ModerationStatus.APPROVED },
          include: {
            associatedProducts: {
              include: { product: { select: { id: true, name: true, slug: true } } },
            },
          },
        },
      },
    });

    if (!provider || provider.status !== ProviderStatus.APPROVED) {
      // Unpublish provider and all its products
      await prisma.$transaction([
        prisma.publishedProduct.deleteMany({ where: { providerId } }),
        prisma.publishedProvider.deleteMany({ where: { providerId } }),
      ]);
      return null;
    }

    // 1. Serialize provider master profile
    const snapshot = serializeProviderPublic(provider);

    // Extract filter columns
    const categoryNumbers = provider.categorySelections.map((c: any) => c.category.number);
    const platforms = Array.from(
      new Set(
        provider.products.flatMap((p: any) => p.integration?.supportedPlatforms || [])
      )
    );

    const publishedProvider = await prisma.publishedProvider.upsert({
      where: { providerId: provider.id },
      update: {
        slug: provider.slug,
        name: provider.brandName || provider.legalName || 'Solutions Provider',
        headquartersCountryCode: provider.headquartersCountryCode,
        operatingRegions: provider.operatingRegions || [],
        categoryNumbers,
        languages: provider.languages || [],
        customerTypes: provider.customerTypes || [],
        companySize: provider.companySize,
        platforms,
        verified: !!provider.verifiedAt,
        ratingAvg: provider.avgRating,
        ratingCount: provider.totalReviews,
        snapshot: snapshot as any,
        updatedAt: new Date(),
      },
      create: {
        providerId: provider.id,
        slug: provider.slug,
        name: provider.brandName || provider.legalName || 'Solutions Provider',
        headquartersCountryCode: provider.headquartersCountryCode,
        operatingRegions: provider.operatingRegions || [],
        categoryNumbers,
        languages: provider.languages || [],
        customerTypes: provider.customerTypes || [],
        companySize: provider.companySize,
        platforms,
        verified: !!provider.verifiedAt,
        ratingAvg: provider.avgRating,
        ratingCount: provider.totalReviews,
        snapshot: snapshot as any,
      },
    });

    // 2. Publish approved products and prune unapproved ones
    const approvedProductIds = provider.products.map((p: any) => p.id);

    // Remove products no longer approved
    await prisma.publishedProduct.deleteMany({
      where: {
        providerId: provider.id,
        productId: { notIn: approvedProductIds },
      },
    });

    // Upsert approved products
    for (const product of provider.products) {
      const prodSnapshot = serializeProductPublic({
        ...product,
        provider: {
          brandName: provider.brandName,
          legalName: provider.legalName,
          slug: provider.slug,
        },
      });

      const prodCategoryNumbers = product.categoryLinks.map((l: any) => l.category.number);
      const subcategoryKeys = product.categoryLinks
        .map((l: any) => l.subcategoryKey)
        .filter(Boolean) as string[];

      await prisma.publishedProduct.upsert({
        where: { productId: product.id },
        update: {
          providerId: provider.id,
          slug: product.slug,
          productType: product.productType,
          categoryNumbers: prodCategoryNumbers,
          subcategoryKeys,
          pricingVisibility: product.pricing?.visibility || 'CUSTOM_QUOTE',
          priceFrom: product.pricing?.price || null,
          currency: product.pricing?.currency || 'USD',
          availability: product.availability,
          snapshot: prodSnapshot as any,
          updatedAt: new Date(),
        },
        create: {
          productId: product.id,
          providerId: provider.id,
          slug: product.slug,
          productType: product.productType,
          categoryNumbers: prodCategoryNumbers,
          subcategoryKeys,
          pricingVisibility: product.pricing?.visibility || 'CUSTOM_QUOTE',
          priceFrom: product.pricing?.price || null,
          currency: product.pricing?.currency || 'USD',
          availability: product.availability,
          snapshot: prodSnapshot as any,
        },
      });
    }

    return publishedProvider;
  }
}

export const providerPublishService = new ProviderPublishService();

