import { z } from 'zod';
import { ProviderAccountType, AddressType } from '@prisma/client';

export const providerContactSchema = z.object({
  id: z.string().uuid().optional(),
  fullName: z.string().trim().min(2, 'Contact name must be at least 2 characters').max(150),
  jobTitle: z.string().trim().max(100).optional().nullable(),
  email: z.string().trim().email('Valid contact email is required'),
  phone: z.string().trim().max(50).optional().nullable(),
  isPrimary: z.boolean().default(false),
  isPublic: z.boolean().default(false),
});

export const providerAddressSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.nativeEnum(AddressType).default(AddressType.OFFICE),
  label: z.string().trim().max(100).optional().nullable(),
  line1: z.string().trim().min(1, 'Address line 1 is required').max(200),
  line2: z.string().trim().max(200).optional().nullable(),
  countryCode: z.string().trim().min(2).max(10),
  stateCode: z.string().trim().max(50).optional().nullable(),
  stateName: z.string().trim().max(100).optional().nullable(),
  city: z.string().trim().min(1, 'City is required').max(100),
  postalCode: z.string().trim().max(30).optional().nullable(),
  isPrivate: z.boolean().default(false),
});

export const providerSocialLinkSchema = z.object({
  id: z.string().uuid().optional(),
  platform: z.string().trim().min(1).max(50),
  url: z.string().trim().url('Must be a valid URL'),
});

export const updateProviderProfileSchema = z.object({
  // Account & Identity (Form 2 A)
  legalName: z.string().trim().min(2).max(200).optional().nullable(),
  brandName: z.string().trim().min(2).max(200).optional().nullable(),
  registrationNumber: z.string().trim().max(100).optional().nullable(),
  registrationAuthority: z.string().trim().max(150).optional().nullable(),
  registrationAuthorityOther: z.string().trim().max(150).optional().nullable(),
  yearEstablished: z.coerce.number().int().min(1900).max(new Date().getFullYear()).optional().nullable(),
  website: z.string().trim().url('Website must be a valid URL').optional().nullable().or(z.literal('')),
  companyEmail: z.string().trim().email().optional().nullable().or(z.literal('')),
  tagline: z.string().trim().max(250).optional().nullable(),
  overview: z.string().trim().max(10000).optional().nullable(),
  accountType: z.nativeEnum(ProviderAccountType).optional(),
  accountTypeOther: z.string().trim().max(100).optional().nullable(),

  // Operations (Form 2 B, C, D, E)
  headquartersCountryCode: z.string().trim().max(10).optional().nullable(),
  operatingRegions: z.array(z.string().trim()).optional(),
  companySize: z.string().trim().max(100).optional().nullable(),
  customerTypes: z.array(z.string().trim()).optional(),
  languages: z.array(z.string().trim()).optional(),

  // Support (Form 2 F)
  supportAvailability: z.string().trim().max(100).optional().nullable(),
  supportChannels: z.array(z.string().trim()).optional(),
  publicContactPreference: z.string().trim().max(100).optional().nullable(),
  supportDays: z.array(z.string().trim()).optional(),
  timezone: z.string().trim().max(100).optional().nullable(),

  // Commercial (Form 6)
  pricingApproach: z.string().trim().max(100).optional().nullable(),
  preferredContractType: z.string().trim().max(100).optional().nullable(),
  acceptedCurrencies: z.array(z.string().trim()).optional(),
  minimumEngagement: z.string().trim().max(100).optional().nullable(),
  enterpriseProposals: z.string().trim().max(100).optional().nullable(),
  negotiablePricing: z.string().trim().max(100).optional().nullable(),
  implementationCharges: z.string().trim().max(100).optional().nullable(),
  supportCharges: z.string().trim().max(100).optional().nullable(),
  renewalTerms: z.string().trim().max(5000).optional().nullable(),
  cancellationTerms: z.string().trim().max(5000).optional().nullable(),
  taxTreatment: z.string().trim().max(100).optional().nullable(),
  commercialContact: z.string().trim().max(150).optional().nullable(),

  // Sub-entities
  contacts: z.array(providerContactSchema).optional(),
  addresses: z.array(providerAddressSchema).optional(),
  socialLinks: z.array(providerSocialLinkSchema).optional(),
});

export const selectCategoriesSchema = z.object({
  categoryNumbers: z.array(z.number().int().min(1).max(10)).min(1, 'Please select at least one category').max(10),
  primaryCategoryNumber: z.number().int().min(1).max(10),
  subcategories: z.record(z.string(), z.array(z.string())).optional(),
}).refine((data) => data.categoryNumbers.includes(data.primaryCategoryNumber), {
  message: 'Primary category must be one of the selected categories',
  path: ['primaryCategoryNumber'],
});

export const saveCategoryDraftSchema = z.object({
  answers: z.record(z.any()).default({}),
  subcategoryId: z.string().uuid().optional().nullable(),
});

export const submitCategorySchema = z.object({
  answers: z.record(z.any()),
  subcategoryId: z.string().uuid().optional().nullable(),
});
