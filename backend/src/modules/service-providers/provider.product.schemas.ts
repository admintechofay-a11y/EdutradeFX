import { z } from 'zod';
import {
  ProductAvailability,
  ProductStatus,
  ProductMediaKind,
  DocumentVisibility,
  PricingVisibility,
} from '@prisma/client';

export const createProductSchema = z.object({
  name: z.string().trim().min(2, 'Product name must be at least 2 characters').max(150),
  slug: z.string().trim().min(2).max(150).optional(),
  shortDescription: z.string().trim().min(10, 'Short description must be at least 10 characters').max(500),
  fullDescription: z.string().trim().max(10000).optional().nullable(),
  productType: z.string().trim().min(2).max(100),
  version: z.string().trim().max(50).optional().nullable(),
  initialReleaseDate: z.string().optional().nullable(),
  latestUpdateDate: z.string().optional().nullable(),
  availability: z.nativeEnum(ProductAvailability).default(ProductAvailability.AVAILABLE),
  officialUrl: z.string().trim().url().optional().nullable().or(z.literal('')),
  demoUrl: z.string().trim().url().optional().nullable().or(z.literal('')),
  userGuideUrl: z.string().trim().url().optional().nullable().or(z.literal('')),
  brochureUrl: z.string().trim().url().optional().nullable().or(z.literal('')),
  mainPurposes: z.array(z.string().trim()).default([]),
  keyFeatures: z.array(z.string().trim()).default([]),
  additionalFeatures: z.array(z.string().trim()).default([]),
  benefits: z.string().trim().max(5000).optional().nullable(),
  targetCustomers: z.array(z.string().trim()).default([]),
  limitations: z.string().trim().max(5000).optional().nullable(),
  useCases: z.string().trim().max(5000).optional().nullable(),
  supportHours: z.string().trim().max(100).optional().nullable(),
  supportChannels: z.array(z.string().trim()).default([]),
  maintenance: z.string().trim().max(500).optional().nullable(),
  technicalSupportIncluded: z.boolean().optional().nullable(),
  softwareUpdates: z.boolean().optional().nullable(),
  warranty: z.string().trim().max(500).optional().nullable(),
  responseTime: z.record(z.any()).optional().nullable(),
});

export const updateProductSchema = createProductSchema.partial();

export const productCategoryLinkSchema = z.object({
  categoryId: z.string().uuid(),
  subcategoryKey: z.string().trim().optional().nullable(),
  isPrimary: z.boolean().default(false),
  answers: z.record(z.any()).optional(),
});

export const updateTechnicalSpecSchema = z.object({
  architecture: z.string().trim().max(100).optional().nullable(),
  deploymentModel: z.string().trim().max(100).optional().nullable(),
  hostingRequirement: z.string().trim().max(100).optional().nullable(),
  operatingSystems: z.array(z.string().trim()).default([]),
  hardwareRequirements: z.string().trim().max(1000).optional().nullable(),
  supportedVersions: z.string().trim().max(500).optional().nullable(),
  technicalDocUrl: z.string().trim().url().optional().nullable().or(z.literal('')),
  securityFeatures: z.array(z.string().trim()).default([]),
  dataRetention: z.string().trim().max(500).optional().nullable(),
  implementationTime: z.string().trim().max(200).optional().nullable(),
  prerequisites: z.string().trim().max(2000).optional().nullable(),
});

export const updateIntegrationSchema = z.object({
  supportedPlatforms: z.array(z.string().trim()).default([]),
  methods: z.array(z.string().trim()).default([]),
  capabilities: z.array(z.string().trim()).default([]),
  availability: z.string().trim().max(100).optional().nullable(),
  partnerName: z.string().trim().max(150).optional().nullable(),
  documentationUrl: z.string().trim().url().optional().nullable().or(z.literal('')),
  integrationFee: z.string().trim().max(100).optional().nullable(),
});

export const updatePricingSchema = z.object({
  visibility: z.nativeEnum(PricingVisibility).default(PricingVisibility.CUSTOM_QUOTE),
  models: z.array(z.string().trim()).default([]),
  currency: z.string().trim().min(3).max(5).default('USD'),
  price: z.coerce.number().min(0).optional().nullable(),
  setupFee: z.record(z.any()).optional().nullable(),
  monthlyFee: z.record(z.any()).optional().nullable(),
  annualFee: z.record(z.any()).optional().nullable(),
  perAccountFee: z.record(z.any()).optional().nullable(),
  perUserFee: z.record(z.any()).optional().nullable(),
  perTransactionFee: z.record(z.any()).optional().nullable(),
  minimumCommitment: z.record(z.any()).optional().nullable(),
  contractDuration: z.string().trim().max(100).optional().nullable(),
  implementationFee: z.record(z.any()).optional().nullable(),
  supportFee: z.record(z.any()).optional().nullable(),
  additionalModules: z.array(z.record(z.any())).default([]),
  freeTrial: z.boolean().optional().nullable(),
  trialDays: z.coerce.number().int().min(0).optional().nullable(),
  enterpriseDiscount: z.string().trim().max(200).optional().nullable(),
  taxTreatment: z.string().trim().max(100).optional().nullable(),
  pricingValidUntil: z.string().optional().nullable(),
  pricingUrl: z.string().trim().url().optional().nullable().or(z.literal('')),
});

export const createMediaSchema = z.object({
  kind: z.nativeEnum(ProductMediaKind).default(ProductMediaKind.IMAGE),
  mediaType: z.string().trim().min(1).max(50),
  url: z.string().trim().url('Must be a valid URL'),
  publicId: z.string().trim().optional().nullable(),
  videoUrl: z.string().trim().url().optional().nullable().or(z.literal('')),
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().max(1000).optional().nullable(),
  platform: z.string().trim().max(100).optional().nullable(),
  timeframe: z.string().trim().max(50).optional().nullable(),
  symbol: z.string().trim().max(50).optional().nullable(),
  screenshotType: z.string().trim().max(100).optional().nullable(),
  isCover: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
  rightsConfirmed: z.boolean().refine((v) => v === true, {
    message: 'You must confirm ownership/rights to upload media',
  }),
});

export const updateMediaSchema = createMediaSchema.partial();

export const createProductDocSchema = z.object({
  docType: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(150),
  fileUrl: z.string().trim().url('Must be a valid URL'),
  publicId: z.string().trim().min(1),
  visibility: z.nativeEnum(DocumentVisibility).default(DocumentVisibility.PUBLIC),
});
