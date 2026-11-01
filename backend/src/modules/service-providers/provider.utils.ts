import { prisma } from '../../config/database';
import { ProductStatus } from '@prisma/client';

/**
 * Generates an atomic provider code in format ETP-XXXXXX (e.g. ETP-000001).
 */
export async function generateProviderCode(): Promise<string> {
  const counter = await prisma.counter.upsert({
    where: { key: 'provider_code' },
    update: { value: { increment: 1 } },
    create: { key: 'provider_code', value: 1 },
  });
  const padded = String(counter.value).padStart(6, '0');
  return `ETP-${padded}`;
}

/**
 * Generates an atomic application reference in format APP-YYYY-XXXXXX (e.g. APP-2026-000001).
 */
export async function generateApplicationRef(): Promise<string> {
  const year = new Date().getFullYear();
  const counterKey = `app_ref_${year}`;
  const counter = await prisma.counter.upsert({
    where: { key: counterKey },
    update: { value: { increment: 1 } },
    create: { key: counterKey, value: 1 },
  });
  const padded = String(counter.value).padStart(6, '0');
  return `APP-${year}-${padded}`;
}

/**
 * Calculates overall completion across Form 2 (Company), Form 6 (Commercial),
 * Categories, Products, Team, and Documents.
 */
export async function calculateOverallCompletion(providerId: string): Promise<number> {
  const provider = await prisma.serviceProvider.findUnique({
    where: { id: providerId },
    include: {
      categorySelections: {
        where: { isSelected: true },
        select: { completionPercent: true },
      },
      products: {
        where: { status: { not: ProductStatus.ARCHIVED } },
        select: { id: true },
      },
      teamMembers: {
        select: { id: true },
      },
      documents: {
        select: { id: true },
      },
    },
  });

  if (!provider) return 0;

  // 1. Company identity & basic operations (Form 2)
  const requiredCompanyFields = [
    provider.legalName,
    provider.brandName,
    provider.website,
    provider.companyEmail,
    provider.headquartersCountryCode,
    provider.overview,
  ];
  const filledCompany = requiredCompanyFields.filter(Boolean).length;
  const companyScore = Math.round((filledCompany / requiredCompanyFields.length) * 100);

  // 2. Categories score
  let categoriesScore = 0;
  if (provider.categorySelections.length > 0) {
    const totalCatScore = provider.categorySelections.reduce(
      (acc: number, cat: any) => acc + (cat.completionPercent || 0),
      0
    );
    categoriesScore = Math.round(totalCatScore / provider.categorySelections.length);
  }

  // 3. Overall weighted score
  // Form 2 (40%) + Categories (60%)
  const overall = Math.min(100, Math.round(companyScore * 0.4 + categoriesScore * 0.6));

  await prisma.serviceProvider.update({
    where: { id: providerId },
    data: { completionPercent: overall },
  });

  return overall;
}
