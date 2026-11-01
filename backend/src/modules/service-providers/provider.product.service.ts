import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { StatusCodes } from 'http-status-codes';
import { ProductStatus, FormScope } from '@prisma/client';
import { buildAnswerSchema } from '../provider-forms/form.engine';
import { calculateOverallCompletion } from './provider.utils';
import { providerProductExtService } from './provider.product-ext.service';

export class ProviderProductService {
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

  // ── PRODUCTS MASTER (Form 3) ────────────────────────────────────────────
  async getMyProducts(userId: string) {
    const providerId = await this.getProviderId(userId);
    return prisma.serviceProviderProduct.findMany({
      where: {
        providerId,
        status: { not: ProductStatus.ARCHIVED },
      },
      include: {
        categoryLinks: {
          include: {
            category: {
              select: { id: true, number: true, name: true, slug: true },
            },
          },
        },
        categoryDetails: true,
        technicalSpec: true,
        integration: true,
        pricing: true,
        media: { orderBy: { displayOrder: 'asc' } },
        documents: { orderBy: { createdAt: 'desc' } },
        _count: { select: { teamMembers: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProductById(userId: string, productId: string) {
    const providerId = await this.getProviderId(userId);
    const product = await prisma.serviceProviderProduct.findFirst({
      where: { id: productId, providerId },
      include: {
        categoryLinks: {
          include: {
            category: { select: { id: true, number: true, name: true, slug: true } },
          },
        },
        categoryDetails: true,
        technicalSpec: true,
        integration: true,
        pricing: true,
        media: { orderBy: { displayOrder: 'asc' } },
        documents: { orderBy: { createdAt: 'desc' } },
        teamMembers: {
          include: {
            teamMember: {
              select: { id: true, fullName: true, jobTitle: true, photoUrl: true },
            },
          },
        },
      },
    });

    if (!product) {
      throw new AppError('Product not found.', StatusCodes.NOT_FOUND);
    }
    return product;
  }

  async createProduct(userId: string, data: any) {
    const providerId = await this.getProviderId(userId);
    const rawSlug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const slug = `${rawSlug.replace(/^-+|-+$/g, '')}-${Date.now().toString().slice(-4)}`;

    const product = await prisma.serviceProviderProduct.create({
      data: {
        ...data,
        providerId,
        slug,
        status: ProductStatus.DRAFT,
        initialReleaseDate: data.initialReleaseDate ? new Date(data.initialReleaseDate) : null,
        latestUpdateDate: data.latestUpdateDate ? new Date(data.latestUpdateDate) : null,
      },
    });

    await calculateOverallCompletion(providerId);
    return product;
  }

  async updateProduct(userId: string, productId: string, data: any) {
    const providerId = await this.getProviderId(userId);
    const existing = await prisma.serviceProviderProduct.findFirst({
      where: { id: productId, providerId },
      select: { id: true },
    });
    if (!existing) {
      throw new AppError('Product not found.', StatusCodes.NOT_FOUND);
    }

    const { categoryLinks, initialReleaseDate, latestUpdateDate, ...rest } = data;

    const product = await prisma.serviceProviderProduct.update({
      where: { id: productId },
      data: {
        ...rest,
        ...(initialReleaseDate !== undefined && {
          initialReleaseDate: initialReleaseDate ? new Date(initialReleaseDate) : null,
        }),
        ...(latestUpdateDate !== undefined && {
          latestUpdateDate: latestUpdateDate ? new Date(latestUpdateDate) : null,
        }),
      },
    });

    await calculateOverallCompletion(providerId);
    return product;
  }

  async deleteProduct(userId: string, productId: string) {
    const providerId = await this.getProviderId(userId);
    const product = await prisma.serviceProviderProduct.update({
      where: { id: productId, providerId },
      data: {
        status: ProductStatus.ARCHIVED,
        archivedAt: new Date(),
      },
    });

    await calculateOverallCompletion(providerId);
    return product;
  }

  // ── PRODUCT CATEGORY LINKS & DETAILS (Cat 10 C-N) ─────────────────────────
  async linkCategory(
    userId: string,
    productId: string,
    data: { categoryId: string; subcategoryKey?: string; isPrimary?: boolean; answers?: any }
  ) {
    const providerId = await this.getProviderId(userId);
    const product = await prisma.serviceProviderProduct.findFirst({
      where: { id: productId, providerId },
      select: { id: true },
    });
    if (!product) throw new AppError('Product not found.', StatusCodes.NOT_FOUND);

    const link = await prisma.productCategoryLink.upsert({
      where: {
        productId_categoryId_subcategoryKey: {
          productId,
          categoryId: data.categoryId,
          subcategoryKey: data.subcategoryKey || '',
        },
      },
      update: {
        isPrimary: data.isPrimary ?? false,
      },
      create: {
        productId,
        categoryId: data.categoryId,
        subcategoryKey: data.subcategoryKey || null,
        isPrimary: data.isPrimary ?? false,
      },
    });

    if (data.answers) {
      await this.saveCategoryDetail(userId, productId, data.categoryId, data.answers);
    }

    return link;
  }

  async saveCategoryDetail(
    userId: string,
    productId: string,
    categoryId: string,
    answers: Record<string, any>
  ) {
    const providerId = await this.getProviderId(userId);
    const product = await prisma.serviceProviderProduct.findFirst({
      where: { id: productId, providerId },
      select: { id: true },
    });
    if (!product) throw new AppError('Product not found.', StatusCodes.NOT_FOUND);

    const categoryDef = await prisma.providerCategory.findUnique({
      where: { id: categoryId },
      include: {
        formSections: {
          where: { isActive: true, scope: FormScope.PRODUCT },
          include: { fields: { where: { isActive: true } } },
        },
      },
    });

    if (!categoryDef) throw new AppError('Category definition not found.', StatusCodes.NOT_FOUND);

    const fields = categoryDef.formSections.flatMap((s: any) => s.fields);
    const schema = buildAnswerSchema(fields, { mode: 'draft' });
    const parsedAnswers = schema.parse(answers);

    return prisma.productCategoryDetail.upsert({
      where: {
        productId_categoryId: {
          productId,
          categoryId,
        },
      },
      update: { answers: parsedAnswers, updatedAt: new Date() },
      create: { productId, categoryId, answers: parsedAnswers },
    });
  }

  // ── TECHNICAL SPECS (Form 4) ─────────────────────────────────────────────
  async updateTechnicalSpec(userId: string, productId: string, data: any) {
    const providerId = await this.getProviderId(userId);
    const product = await prisma.serviceProviderProduct.findFirst({
      where: { id: productId, providerId },
      select: { id: true },
    });
    if (!product) throw new AppError('Product not found.', StatusCodes.NOT_FOUND);

    return prisma.productTechnicalSpec.upsert({
      where: { productId },
      update: { ...data, updatedAt: new Date() },
      create: { ...data, productId },
    });
  }

  // ── INTEGRATIONS (Form 5) ────────────────────────────────────────────────
  async updateIntegration(userId: string, productId: string, data: any) {
    const providerId = await this.getProviderId(userId);
    const product = await prisma.serviceProviderProduct.findFirst({
      where: { id: productId, providerId },
      select: { id: true },
    });
    if (!product) throw new AppError('Product not found.', StatusCodes.NOT_FOUND);

    return prisma.productIntegration.upsert({
      where: { productId },
      update: { ...data, updatedAt: new Date() },
      create: { ...data, productId },
    });
  }

  // ── PRICING (Form 7) ─────────────────────────────────────────────────────
  async updatePricing(userId: string, productId: string, data: any) {
    const providerId = await this.getProviderId(userId);
    const product = await prisma.serviceProviderProduct.findFirst({
      where: { id: productId, providerId },
      select: { id: true },
    });
    if (!product) throw new AppError('Product not found.', StatusCodes.NOT_FOUND);

    const { pricingValidUntil, ...rest } = data;

    return prisma.productPricing.upsert({
      where: { productId },
      update: {
        ...rest,
        ...(pricingValidUntil !== undefined && {
          pricingValidUntil: pricingValidUntil ? new Date(pricingValidUntil) : null,
        }),
        updatedAt: new Date(),
      },
      create: {
        ...rest,
        productId,
        pricingValidUntil: pricingValidUntil ? new Date(pricingValidUntil) : null,
      },
    });
  }

  // Delegated to ProviderProductExtService
  addMedia = providerProductExtService.addMedia.bind(providerProductExtService);
  deleteMedia = providerProductExtService.deleteMedia.bind(providerProductExtService);
  addDocument = providerProductExtService.addDocument.bind(providerProductExtService);
  deleteDocument = providerProductExtService.deleteDocument.bind(providerProductExtService);
  duplicateProduct = providerProductExtService.duplicateProduct.bind(providerProductExtService);
}

export const providerProductService = new ProviderProductService();
