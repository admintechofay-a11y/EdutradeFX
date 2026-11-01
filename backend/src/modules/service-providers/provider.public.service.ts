import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { StatusCodes } from 'http-status-codes';
import { serializeProviderPublic } from './provider.serializer';
import { sendMailSafely } from '../../utils/email.utils';
import { ModerationStatus } from '@prisma/client';

export interface DirectoryQueryFilters {
  category?: number;
  platform?: string;
  country?: string;
  verifiedOnly?: boolean;
  search?: string;
  pricingModel?: string;
  sortBy?: 'rating' | 'newest' | 'name';
  page?: number;
  limit?: number;
}

export class ProviderPublicService {
  /**
   * Retrieves paginated public directory of approved solutions providers.
   * Reads strictly from PublishedProvider.
   */
  async getDirectory(filters: DirectoryQueryFilters = {}) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(50, Math.max(1, filters.limit || 12));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.category) {
      where.categoryNumbers = { has: Number(filters.category) };
    }
    if (filters.platform) {
      where.platforms = { has: filters.platform };
    }
    if (filters.country) {
      where.headquartersCountryCode = filters.country.toUpperCase();
    }
    if (filters.verifiedOnly) {
      where.verified = true;
    }
    if (filters.search) {
      const q = filters.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = [{ featuredRank: 'asc' }, { ratingAvg: 'desc' }, { publishedAt: 'desc' }];
    if (filters.sortBy === 'newest') {
      orderBy = [{ publishedAt: 'desc' }];
    } else if (filters.sortBy === 'name') {
      orderBy = [{ name: 'asc' }];
    }

    const [total, providers] = await Promise.all([
      prisma.publishedProvider.count({ where }),
      prisma.publishedProvider.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    const items = providers.map((p: any) => ({
      providerId: p.providerId,
      slug: p.slug,
      name: p.name,
      headquartersCountryCode: p.headquartersCountryCode,
      operatingRegions: p.operatingRegions,
      categoryNumbers: p.categoryNumbers,
      languages: p.languages,
      customerTypes: p.customerTypes,
      companySize: p.companySize,
      platforms: p.platforms,
      verified: p.verified,
      ratingAvg: Number(p.ratingAvg),
      ratingCount: p.ratingCount,
      summary: (p.snapshot as any)?.overview || '',
      logo: (p.snapshot as any)?.logo || null,
      tagline: (p.snapshot as any)?.tagline || null,
    }));

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Retrieves active categories with count of published providers.
   */
  async getCategoriesWithCounts() {
    const [categories, published] = await Promise.all([
      prisma.providerCategory.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          number: true,
          name: true,
          slug: true,
          icon: true,
          shortDescription: true,
          mainServices: true,
        },
      }),
      prisma.publishedProvider.findMany({
        select: { categoryNumbers: true },
      }),
    ]);

    const countMap: Record<number, number> = {};
    for (const p of published) {
      for (const num of p.categoryNumbers) {
        countMap[num] = (countMap[num] || 0) + 1;
      }
    }

    return categories.map((cat: any) => ({
      ...cat,
      providerCount: countMap[cat.number] || 0,
    }));
  }

  /**
   * Retrieves full public profile snapshot for a provider.
   */
  async getProviderBySlug(slug: string) {
    const published = await prisma.publishedProvider.findUnique({
      where: { slug },
      include: {
        provider: {
          include: {
            published: true,
            products: {
              where: { status: 'APPROVED' },
              include: { published: true },
            },
          },
        },
      },
    });

    if (!published) {
      throw new AppError('Solutions Provider profile not found or not published.', StatusCodes.NOT_FOUND);
    }

    const products = published.provider.products
      .filter((p: any) => p.published)
      .map((p: any) => p.published.snapshot);

    return {
      ...(published.snapshot as any),
      products,
    };
  }

  /**
   * Retrieves product snapshot by slug.
   */
  async getProductBySlug(providerSlug: string, productSlug: string) {
    const publishedProduct = await prisma.publishedProduct.findFirst({
      where: {
        slug: productSlug,
        product: { provider: { slug: providerSlug } },
      },
    });

    if (!publishedProduct) {
      throw new AppError('Product not found or not published.', StatusCodes.NOT_FOUND);
    }

    return publishedProduct.snapshot;
  }

  /**
   * Form 9 Live Preview: renders draft data through serializer with preview: true.
   */
  async getProviderPreview(slug: string, userId: string, isAdmin = false) {
    const provider = await prisma.serviceProvider.findUnique({
      where: { slug },
      include: {
        contacts: true,
        addresses: true,
        socialLinks: true,
        categorySelections: {
          where: { isSelected: true },
          include: {
            category: { select: { id: true, number: true, name: true, slug: true } },
            subcategory: { select: { id: true, key: true, label: true } },
          },
        },
        products: {
          where: { status: { not: 'ARCHIVED' } },
          include: {
            categoryLinks: {
              include: { category: { select: { id: true, number: true, name: true, slug: true } } },
            },
            categoryDetails: {
              include: { category: { select: { id: true, number: true, name: true, slug: true } } },
            },
            technicalSpec: true,
            integration: true,
            pricing: true,
            media: true,
            documents: true,
          },
        },
        teamMembers: {
          include: {
            associatedProducts: {
              include: { product: { select: { id: true, name: true, slug: true } } },
            },
          },
        },
      },
    });

    if (!provider) throw new AppError('Provider not found.', StatusCodes.NOT_FOUND);
    if (!isAdmin && provider.userId !== userId) {
      throw new AppError('Access forbidden: You do not have permission to preview this provider.', StatusCodes.FORBIDDEN);
    }

    const previewSnapshot = serializeProviderPublic(provider, { preview: true });
    return previewSnapshot;
  }

  /**
   * Submits a B2B quote or demo enquiry to a provider.
   */
  async submitEnquiry(providerId: string, data: any, userId?: string) {
    const provider = await prisma.serviceProvider.findUnique({
      where: { id: providerId },
      select: { id: true, brandName: true, legalName: true, companyEmail: true },
    });
    if (!provider) throw new AppError('Provider not found.', StatusCodes.NOT_FOUND);

    const enquiry = await prisma.providerEnquiry.create({
      data: {
        providerId,
        productId: data.productId || null,
        categoryId: data.categoryId || null,
        type: data.type || 'GENERAL',
        userId: userId || null,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        companyName: data.companyName || null,
        roleTitle: data.roleTitle || null,
        country: data.country || null,
        message: data.message,
        budgetRange: data.budgetRange || null,
        timeline: data.timeline || null,
        consentToShare: data.consentToShare ?? true,
      },
    });

    // Notify provider without leaking recipient private email
    if (provider.companyEmail) {
      const subject = `New B2B Enquiry on EdutradeFX: ${data.name} from ${data.companyName || 'Potential Client'}`;
      const html = `<p>You have received a new B2B enquiry on EdutradeFX.</p><p><strong>From:</strong> ${data.name} (${data.email})</p><p><strong>Message:</strong></p><blockquote>${data.message}</blockquote>`;
      const text = `You have received a new B2B enquiry on EdutradeFX from ${data.name} (${data.email}):\n\n${data.message}`;
      await sendMailSafely(provider.companyEmail, subject, html, text);
    }

    return enquiry;
  }

  /**
   * Submits a review for a provider or product.
   */
  async submitReview(providerId: string, userId: string, data: any) {
    const existing = await prisma.providerReview.findUnique({
      where: {
        providerId_userId_productId: {
          providerId,
          userId,
          productId: data.productId || '',
        },
      },
    });

    if (existing) {
      throw new AppError('You have already submitted a review for this item.', StatusCodes.CONFLICT);
    }

    return prisma.providerReview.create({
      data: {
        providerId,
        userId,
        productId: data.productId || null,
        rating: data.rating,
        title: data.title || null,
        comment: data.comment,
        status: ModerationStatus.PENDING,
      },
    });
  }
}

export const providerPublicService = new ProviderPublicService();
