import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { StatusCodes } from 'http-status-codes';
import { ProductStatus, ModerationStatus } from '@prisma/client';
import { calculateOverallCompletion } from './provider.utils';

export class ProviderProductExtService {
  private async getProviderId(userId: string): Promise<string> {
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!provider) {
      throw new AppError('Solutions Provider profile not found.', StatusCodes.NOT_FOUND);
    }
    return provider.id;
  }

  // ── MEDIA & SCREENSHOTS ─────────────────────────────────────────────────
  async addMedia(userId: string, productId: string, data: any) {
    const providerId = await this.getProviderId(userId);
    const product = await prisma.serviceProviderProduct.findFirst({
      where: { id: productId, providerId },
      select: { id: true },
    });
    if (!product) throw new AppError('Product not found.', StatusCodes.NOT_FOUND);

    return prisma.productMedia.create({
      data: {
        ...data,
        productId,
        reviewStatus: ModerationStatus.PENDING,
      },
    });
  }

  async deleteMedia(userId: string, productId: string, mediaId: string) {
    const providerId = await this.getProviderId(userId);
    const product = await prisma.serviceProviderProduct.findFirst({
      where: { id: productId, providerId },
      select: { id: true },
    });
    if (!product) throw new AppError('Product not found.', StatusCodes.NOT_FOUND);

    return prisma.productMedia.delete({
      where: { id: mediaId, productId },
    });
  }

  // ── DOCUMENTS ────────────────────────────────────────────────────────────
  async addDocument(userId: string, productId: string, data: any) {
    const providerId = await this.getProviderId(userId);
    const product = await prisma.serviceProviderProduct.findFirst({
      where: { id: productId, providerId },
      select: { id: true },
    });
    if (!product) throw new AppError('Product not found.', StatusCodes.NOT_FOUND);

    return prisma.productDocument.create({
      data: {
        ...data,
        productId,
        reviewStatus: ModerationStatus.PENDING,
      },
    });
  }

  async deleteDocument(userId: string, productId: string, documentId: string) {
    const providerId = await this.getProviderId(userId);
    const product = await prisma.serviceProviderProduct.findFirst({
      where: { id: productId, providerId },
      select: { id: true },
    });
    if (!product) throw new AppError('Product not found.', StatusCodes.NOT_FOUND);

    return prisma.productDocument.delete({
      where: { id: documentId, productId },
    });
  }

  // ── DUPLICATE PRODUCT ────────────────────────────────────────────────────
  async duplicateProduct(userId: string, productId: string) {
    const providerId = await this.getProviderId(userId);
    const original = await prisma.serviceProviderProduct.findFirst({
      where: { id: productId, providerId },
      include: {
        categoryLinks: true,
        categoryDetails: true,
        technicalSpec: true,
        integration: true,
        pricing: true,
        media: true,
      },
    });

    if (!original) throw new AppError('Original product not found.', StatusCodes.NOT_FOUND);

    const rand = Math.round(Math.random() * 1e4);
    const newSlug = `${original.slug}-copy-${rand}`;
    const newName = `${original.name} (Copy)`;

    const duplicated = await prisma.$transaction(async (tx) => {
      const p = await tx.serviceProviderProduct.create({
        data: {
          providerId,
          slug: newSlug,
          name: newName,
          logo: original.logo,
          thumbnail: original.thumbnail,
          shortDescription: original.shortDescription,
          fullDescription: original.fullDescription,
          productType: original.productType,
          version: original.version,
          availability: original.availability,
          officialUrl: original.officialUrl,
          brochureUrl: original.brochureUrl,
          userGuideUrl: original.userGuideUrl,
          demoUrl: original.demoUrl,
          mainPurposes: original.mainPurposes,
          keyFeatures: original.keyFeatures,
          additionalFeatures: original.additionalFeatures,
          benefits: original.benefits,
          targetCustomers: original.targetCustomers,
          limitations: original.limitations,
          useCases: original.useCases,
          supportHours: original.supportHours,
          supportChannels: original.supportChannels,
          maintenance: original.maintenance,
          technicalSupportIncluded: original.technicalSupportIncluded,
          softwareUpdates: original.softwareUpdates,
          warranty: original.warranty,
          status: ProductStatus.DRAFT,
        },
      });

      if (original.technicalSpec) {
        const { id, productId: _pId, createdAt, updatedAt, ...specData } = original.technicalSpec;
        await tx.productTechnicalSpec.create({ data: { ...specData, productId: p.id } });
      }

      if (original.integration) {
        const { id, productId: _pId, createdAt, updatedAt, ...intData } = original.integration;
        await tx.productIntegration.create({ data: { ...intData, productId: p.id } });
      }

      if (original.pricing) {
        const { id, productId: _pId, createdAt, updatedAt, ...prData } = original.pricing;
        await tx.productPricing.create({ data: { ...(prData as any), productId: p.id } });
      }

      for (const link of original.categoryLinks) {
        await tx.productCategoryLink.create({
          data: {
            productId: p.id,
            categoryId: link.categoryId,
            subcategoryKey: link.subcategoryKey,
            isPrimary: link.isPrimary,
          },
        });
      }

      for (const detail of original.categoryDetails) {
        await tx.productCategoryDetail.create({
          data: {
            productId: p.id,
            categoryId: detail.categoryId,
            answers: detail.answers as any,
          },
        });
      }

      return p;
    });

    await calculateOverallCompletion(providerId);
    return duplicated;
  }
}

export const providerProductExtService = new ProviderProductExtService();

