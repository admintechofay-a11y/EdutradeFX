import { z } from 'zod';
import {
  BrokerBusinessType,
  BrokerDocType,
  SpreadType,
  OrderExecution,
  GtcMode,
  IbSettlement,
} from '@prisma/client';
import { validatePhoneE164, normalizeToE164 } from '../../utils/phone.utils';

const currentYear = new Date().getFullYear();

// ─── Helpers & Base Validators ────────────────────────
export const safeUrl = z
  .string()
  .trim()
  .regex(/^https?:\/\/.+/i, 'URL must start with http:// or https://');

export const safeOptionalUrl = z
  .union([safeUrl, z.literal('')])
  .optional()
  .nullable();

export const googleMapsUrl = z
  .string()
  .trim()
  .regex(
    /^https?:\/\/(www\.)?(google\.[a-z.]+\/maps|maps\.google\.[a-z.]+|maps\.app\.goo\.gl|goo\.gl\/maps).+/i,
    'Must be a valid Google Maps link (e.g. https://maps.google.com/... or https://maps.app.goo.gl/...)'
  );

export const optionalGoogleMapsUrl = z
  .union([googleMapsUrl, z.literal('')])
  .optional()
  .nullable();

export const safePhone = z
  .string()
  .trim()
  .refine((val) => !val || validatePhoneE164(val), {
    message: 'Please provide a valid international phone number with country code (e.g. +919876543210)',
  })
  .transform((val) => (val ? normalizeToE164(val) || val : val));

export const ALLOWED_SPREADS = [0.01, 0.1, 0.15, 0.2, 0.25, 0.3, 0.5, 1.0];

// ─── SECTION 1: General Information (B1-B10) ─────────
export const generalSectionSchema = z
  .object({
    registeredName: z.string().trim().min(2, 'Registered Entity Legal Name must be at least 2 characters').max(150).optional().nullable(),
    companyName: z.string().trim().min(2, 'Company name must be at least 2 characters').max(100),
    businessType: z.nativeEnum(BrokerBusinessType).optional().nullable(),
    businessModel: z.nativeEnum(BrokerBusinessType).optional().nullable(),
    address: z.string().max(500).optional().nullable(),
    city: z.string().max(100).optional().nullable(),
    state: z.string().max(100).optional().nullable(),
    postalCode: z.string().max(30).optional().nullable(),
    country: z.string().max(100).optional().nullable(),
    operatingCountries: z.array(z.string().max(100)).max(250).default([]),
    website: safeOptionalUrl,
    mapLink: optionalGoogleMapsUrl,
    ibLink: safeOptionalUrl,
    phone: z.union([safePhone, z.literal('')]).optional().nullable(),
    email: z.union([z.string().email(), z.literal('')]).optional().nullable(),
    yearFounded: z.coerce.number().int().min(1900).max(currentYear).optional().nullable(),
    isRegulated: z.boolean().optional().nullable(),
    totalTradableSymbols: z.coerce.number().int().nonnegative().max(1000000).optional().nullable(),
    accountCurrencies: z.array(z.string().max(10)).max(200).default([]),
    negativeBalanceProtection: z.boolean().optional().nullable(),
    regionalFootprint: z.array(z.string().max(100)).max(50).default([]),
  })
  .passthrough();

// ─── SECTION 2: Devices, Platforms & Servers (B14, B15) ─
export const serverItemSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().min(1, 'Server name required').max(100),
    ip: z.string().max(100).optional().nullable(),
    location: z.string().max(100).optional().nullable(),
    sortOrder: z.coerce.number().int().default(0),
  })
  .passthrough();

export const devicesServersSectionSchema = z
  .object({
    platformDescription: z.string().max(5000).optional().nullable(),
    availablePlatforms: z.array(z.string().max(80)).max(30).default([]),
    platformLinks: z.record(z.string(), z.string()).optional().nullable(),
    deviceSupport: z.array(z.string().max(80)).max(30).default([]),
    servers: z.array(serverItemSchema).max(50).default([]),
  })
  .passthrough();

// ─── SECTION 3: Regulatory Information ───────────────
export const licenseItemSchema = z
  .object({
    id: z.string().uuid().optional(),
    regulatoryBody: z.string().min(1, 'Regulatory body required').max(100),
    regulatorCode: z.string().max(50).optional().nullable(),
    regulatorOther: z.string().max(200).optional().nullable(),
    licenseNumber: z.string().min(1, 'License number required').max(100),
    licenseStatus: z.string().max(50).default('Active'),
    companyAddress: z.string().max(500).optional().nullable(),
    licensePdfUrl: safeOptionalUrl,
    proofUrl: safeOptionalUrl,
    proofLink: safeOptionalUrl,
    sortOrder: z.coerce.number().int().default(0),
  })
  .passthrough();

export const regulatorySectionSchema = z
  .object({
    isRegulated: z.boolean().optional().nullable(),
    licenses: z.array(licenseItemSchema).max(30).default([]),
  })
  .passthrough();

// ─── SECTION 4: Board of Company Profiles ─────────────
export const boardMemberItemSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().min(1, 'Name required').max(100),
    designation: z.string().min(1, 'Designation required').max(100),
    experience: z.string().max(100).optional().nullable(),
    photoUrl: safeOptionalUrl,
    description: z.string().max(2000).optional().nullable(),
    sortOrder: z.coerce.number().int().default(0),
  })
  .passthrough();

export const boardSectionSchema = z
  .object({
    headquarters: z.string().max(200).optional().nullable(),
    officeContactNumber: z.union([safePhone, z.literal('')]).optional().nullable(),
    officeContactEmail: z.union([z.string().email(), z.literal('')]).optional().nullable(),
    boardMembers: z.array(boardMemberItemSchema).max(30).default([]),
  })
  .passthrough();

// ─── SECTION 5: Services & Support (B16) ─────────────
export const servicesSectionSchema = z
  .object({
    countryRestrictions: z.array(z.string().max(100)).max(250).default([]),
    supportPhone: z.union([safePhone, z.literal('')]).optional().nullable(),
    supportWhatsapp: z.union([safePhone, z.literal('')]).optional().nullable(),
    supportEmail: z.union([z.string().email(), z.literal('')]).optional().nullable(),
    supportAvailability: z.string().max(100).optional().nullable(),
    languagesSupported: z.array(z.string().max(50)).max(150).default([]),
  })
  .passthrough();

// ─── SECTION 6: Security ──────────────────────────────
export const securitySectionSchema = z
  .object({
    clientLossPercentage: z.coerce.number().min(0).max(100).optional().nullable(),
    fundsSecurity: z.string().max(5000).optional().nullable(),
  })
  .passthrough();

// ─── SECTION 7: Trading Account Groups (B17-B20) ──────
export const accountGroupItemSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().min(1, 'Account group name required').max(100),
    demoAvailable: z.boolean().default(false),
    currency: z.string().max(10).default('USD'),
    baseCurrencies: z.array(z.string().max(10)).min(1, 'At least one base currency required').default(['USD']),
    currencyCode: z.string().max(20).optional().nullable(),
    currencyOther: z.string().max(100).optional().nullable(),
    spreadTypesLabel: z.string().max(100).optional().nullable(),
    spreadFrom: z.coerce
      .number()
      .refine((val) => ALLOWED_SPREADS.some((s) => Math.abs(s - val) < 0.001), {
        message: 'Spread must be one of: 0.01, 0.10, 0.15, 0.20, 0.25, 0.30, 0.50, 1.00',
      })
      .default(0.1),
    minDeposit: z.coerce.number().min(0).max(10000000).default(0),
    depositBonusPctUpTo: z.coerce.number().min(0).max(500).default(0),
    depositBonusCode: z.string().max(50).optional().nullable(),
    depositBonusNum: z.coerce.number().int().optional().nullable(),
    leverageUpTo: z.string().max(50).default('1:500'),
    leverageCode: z.string().max(50).optional().nullable(),
    leverageNum: z.coerce.number().int().optional().nullable(),
    minTradeVolume: z.coerce.number().min(0).max(1000).default(0.01),
    hasCommissionPerLot: z.boolean().default(false),
    feesPerLot: z.coerce.number().min(0, 'Commission per lot must be numbers only >= 0').max(10000).optional().nullable(),
    commissionStructureUrl: safeOptionalUrl,
    spreadType: z.nativeEnum(SpreadType).default(SpreadType.FLOATING),
    orderTypes: z.array(z.string().max(50)).max(20).default([]),
    swapFree: z.boolean().default(false),
    swapLong: z.string().max(50).optional().nullable(),
    swapShort: z.string().max(50).optional().nullable(),
    orderExecution: z.nativeEnum(OrderExecution).default(OrderExecution.INSTANT),
    gtcMode: z.nativeEnum(GtcMode).optional().nullable(),
    gtcEnabled: z.boolean().default(false),
    eaAllowed: z.boolean().default(true),
    hedgingAllowed: z.boolean().default(true),
    nettingAllowed: z.boolean().default(false),
    scalpingAllowed: z.boolean().default(true),
    hasSwapCharges: z.boolean().default(true),
    swapStructureUrl: safeOptionalUrl,
    slippage: z.boolean().default(false),
    slippagePoints: z.string().max(50).optional().nullable(),
    markups: z.string().max(100).optional().nullable(),
    forexCommission: z.any().optional().nullable(),
    cryptoCommission: z.string().max(100).optional().nullable(),
    commoditiesCommission: z.string().max(100).optional().nullable(),
    metalsCommission: z.string().max(100).optional().nullable(),
    indexCommission: z.string().max(100).optional().nullable(),
    stocksCommission: z.string().max(100).optional().nullable(),
    testLogin: z.string().max(100).optional().nullable(),
    testPassword: z.string().max(100).optional().nullable(),
    testServer: z.string().max(100).optional().nullable(),
    sortOrder: z.coerce.number().int().default(0),
  })
  .passthrough();

export const accountGroupsSectionSchema = z
  .object({
    accountGroups: z.array(accountGroupItemSchema).max(30).default([]),
  })
  .passthrough();

// ─── SECTION 8: IB Program (B21, B22) ────────────────
export const ibPlanItemSchema = z
  .object({
    id: z.string().uuid().optional(),
    accountGroupName: z.string().min(1, 'Account group name required').max(100),
    settlement: z.array(z.nativeEnum(IbSettlement)).max(10).default([]),
    rebatePerLot: z.coerce.number().min(0, 'Commission per lot must be numbers only >= 0').max(10000).default(0),
    levelsUpTo: z.coerce.number().int().min(1).max(50).default(1),
    customizable: z.boolean().default(false),
    sortOrder: z.coerce.number().int().default(0),
  })
  .passthrough();

export const ibSectionSchema = z
  .object({
    ibPlans: z.array(ibPlanItemSchema).max(30).default([]),
  })
  .passthrough();

// ─── SECTION 9: Deposit Methods ───────────────────────
export const depositMethodItemSchema = z
  .object({
    id: z.string().uuid().optional(),
    method: z.string().min(1, 'Method name required').max(100),
    charges: z.string().max(100).optional().nullable(),
    exchangeRate: z.string().max(100).optional().nullable(),
    timeTaken: z.string().max(100).optional().nullable(),
    extraFacilities: z.string().max(250).optional().nullable(),
    sortOrder: z.coerce.number().int().default(0),
  })
  .passthrough();

export const depositsSectionSchema = z
  .object({
    depositMethods: z.array(depositMethodItemSchema).max(50).default([]),
  })
  .passthrough();

// ─── SECTION 10: Withdrawal Methods ───────────────────
export const withdrawalMethodItemSchema = z
  .object({
    id: z.string().uuid().optional(),
    method: z.string().min(1, 'Method name required').max(100),
    charges: z.string().max(100).optional().nullable(),
    exchangeRate: z.string().max(100).optional().nullable(),
    timeTaken: z.string().max(100).optional().nullable(),
    extraFacilities: z.string().max(250).optional().nullable(),
    delayCompensation: z.string().max(2000).optional().nullable(),
    sortOrder: z.coerce.number().int().default(0),
  })
  .passthrough();

export const withdrawalsSectionSchema = z
  .object({
    withdrawalMethods: z.array(withdrawalMethodItemSchema).max(50).default([]),
  })
  .passthrough();

// ─── SECTION 11: Dealing & Our Liquidity Providers (LP) (B24) ─
export const dealingSectionSchema = z
  .object({
    liquidityProviders: z
      .union([
        z.array(z.string().trim().min(1).max(80)),
        z.string().transform((str) => str.split(',').map((s) => s.trim()).filter(Boolean)),
      ])
      .default([]),
    liquidityProvider: z.string().optional().nullable(),
    personalBookSize: z.string().max(250).optional().nullable(),
  })
  .passthrough();

// ─── SECTION 12: Primary Regional Footprint (B19 / Addendum) ───
export const REGIONAL_FOOTPRINT_CODES = [
  'UK_EEA',
  'EUROPE_NON_EEA',
  'NORTH_AMERICA',
  'CENTRAL_AMERICA',
  'CARIBBEAN',
  'SOUTH_AMERICA',
  'MIDDLE_EAST',
  'NORTH_AFRICA',
  'WEST_AFRICA',
  'EAST_AFRICA',
  'CENTRAL_AFRICA',
  'SOUTHERN_AFRICA',
  'SOUTH_ASIA',
  'CENTRAL_ASIA',
  'EAST_ASIA',
  'SOUTHEAST_ASIA',
  'ANZ',
  'PACIFIC_ISLANDS',
  'GLOBAL',
  'OTHER_EMERGING',
] as const;

export type RegionalFootprintCode = (typeof REGIONAL_FOOTPRINT_CODES)[number];

export const REGIONAL_FOOTPRINT_LABELS: Record<RegionalFootprintCode, string> = {
  UK_EEA: 'United Kingdom & Europe (EEA)',
  EUROPE_NON_EEA: 'Europe (Non-EEA)',
  NORTH_AMERICA: 'North America',
  CENTRAL_AMERICA: 'Central America',
  CARIBBEAN: 'Caribbean',
  SOUTH_AMERICA: 'South America',
  MIDDLE_EAST: 'Middle East',
  NORTH_AFRICA: 'North Africa',
  WEST_AFRICA: 'West Africa',
  EAST_AFRICA: 'East Africa',
  CENTRAL_AFRICA: 'Central Africa',
  SOUTHERN_AFRICA: 'Southern Africa',
  SOUTH_ASIA: 'South Asia',
  CENTRAL_ASIA: 'Central Asia',
  EAST_ASIA: 'East Asia',
  SOUTHEAST_ASIA: 'Southeast Asia',
  ANZ: 'Australia & New Zealand',
  PACIFIC_ISLANDS: 'Pacific Islands',
  GLOBAL: 'Global / Worldwide',
  OTHER_EMERGING: 'Other / Emerging Markets',
};

export const businessAreaItemSchema = z
  .object({
    id: z.string().uuid().optional(),
    regionCode: z.enum(REGIONAL_FOOTPRINT_CODES),
    countryOrRegion: z.string().optional(),
    sortOrder: z.coerce.number().int().optional(),
  })
  .strip();

const businessAreasBaseSchema = z
  .object({
    businessAreas: z.array(businessAreaItemSchema).max(20, 'Maximum 20 regions allowed').default([]),
  })
  .strip()
  .refine(
    (data: { businessAreas: Array<z.infer<typeof businessAreaItemSchema>> }) => {
      const codes = data.businessAreas.map((b) => b.regionCode);
      const unique = new Set(codes);
      return unique.size === codes.length;
    },
    {
      message: 'Duplicate regions are not allowed',
      path: ['businessAreas'],
    }
  )
  .refine(
    (data: { businessAreas: Array<z.infer<typeof businessAreaItemSchema>> }) => {
      const codes = data.businessAreas.map((b) => b.regionCode);
      if (codes.includes('GLOBAL') && codes.length > 1) {
        return false;
      }
      return true;
    },
    {
      message: 'Global / Worldwide is exclusive and cannot be combined with other regions',
      path: ['businessAreas'],
    }
  );

export const businessAreasSectionSchema = z.preprocess((val: any) => {
  if (!val || typeof val !== 'object') return val;
  // Normalize regionalFootprint array of codes or labels into businessAreas items
  if (Array.isArray(val.regionalFootprint) && !val.businessAreas) {
    return {
      ...val,
      businessAreas: val.regionalFootprint.map((rf: string, idx: number) => {
        if (REGIONAL_FOOTPRINT_CODES.includes(rf as any)) {
          return { regionCode: rf, sortOrder: idx + 1 };
        }
        const entry = Object.entries(REGIONAL_FOOTPRINT_LABELS).find(([_, label]) => label === rf);
        return { regionCode: entry ? (entry[0] as RegionalFootprintCode) : 'OTHER_EMERGING', sortOrder: idx + 1 };
      }),
    };
  }
  return val;
}, businessAreasBaseSchema);

// ─── SECTION 13: Pros & Cons ──────────────────────────
export const prosConsSectionSchema = z
  .object({
    prosList: z.array(z.string().max(250)).max(30).default([]),
    consList: z.array(z.string().max(250)).max(30).default([]),
  })
  .passthrough();

// ─── SECTION 13: Awards & Expos ───────────────────────
export const awardItemSchema = z
  .object({
    id: z.string().uuid().optional(),
    year: z.coerce.number().int().min(1900).max(currentYear),
    awardFor: z.string().min(1, 'Award title required').max(250),
    expo: z.string().max(250).optional().nullable(),
    expoLocation: z.string().max(250).optional().nullable(),
    expoDate: z.string().datetime().optional().nullable().or(z.literal('')),
    sortOrder: z.coerce.number().int().default(0),
  })
  .passthrough();

export const awardsSectionSchema = z
  .object({
    awards: z.array(awardItemSchema).max(50).default([]),
  })
  .passthrough();

// ─── SECTION 14: Social & Video (B27) ─────────────────
export const socialSectionSchema = z
  .object({
    socialLinks: z
      .object({
        linkedin: safeOptionalUrl,
        twitter: safeOptionalUrl,
        instagram: safeOptionalUrl,
        facebook: safeOptionalUrl,
        youtube: safeOptionalUrl,
      })
      .partial()
      .optional()
      .nullable(),
    promoVideoUrl: safeOptionalUrl,
    promoVideoPublicId: z.string().optional().nullable(),
  })
  .passthrough();

// ─── SECTION 15: Policies ─────────────────────────────
export const policyDocumentItemSchema = z
  .object({
    id: z.string().uuid().optional(),
    docType: z.nativeEnum(BrokerDocType),
    fileUrl: safeUrl,
    fileName: z.string().min(1).max(255),
    fileType: z.string().max(100).default('application/pdf'),
    isPrivate: z.boolean().default(false),
  })
  .passthrough();

export const policiesSectionSchema = z
  .object({
    policies: z.array(policyDocumentItemSchema).max(30).default([]),
  })
  .passthrough();

// ─── Section Registry Map ─────────────────────────────
export const sectionSchemas = {
  general: generalSectionSchema,
  'devices-servers': devicesServersSectionSchema,
  regulatory: regulatorySectionSchema,
  board: boardSectionSchema,
  services: servicesSectionSchema,
  support: servicesSectionSchema,
  security: securitySectionSchema,
  'funds-loss': securitySectionSchema,
  'account-groups': accountGroupsSectionSchema,
  ib: ibSectionSchema,
  'ib-program': ibSectionSchema,
  deposits: depositsSectionSchema,
  'deposit-methods': depositsSectionSchema,
  withdrawals: withdrawalsSectionSchema,
  'withdrawal-methods': withdrawalsSectionSchema,
  dealing: dealingSectionSchema,
  'pros-cons': prosConsSectionSchema,
  awards: awardsSectionSchema,
  social: socialSectionSchema,
  policies: policiesSectionSchema,
  // Deprecated backward-compatible fallback handlers
  symbols: z.any(),
  'symbol-specs': z.any(),
  funding: z.any(),
  activity: z.any(),
  'business-areas': businessAreasSectionSchema,
};

export type WizardSectionKey = keyof typeof sectionSchemas;

// ─── Strict Submit Schema ─────────────────────────────
export const submitBrokerOnboardingSchema = z.object({
  declaration: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm that all submitted details and credentials are true and accurate.' }),
  }),
});

// ─── Public Queries & Reviews ─────────────────────────
export const brokerReviewSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  title: z.string().min(2, 'Review title must be at least 2 characters').max(100),
  comment: z.string().min(3, 'Comment must be at least 3 characters').max(2000),
  pros: z.string().max(500).optional(),
  cons: z.string().max(500).optional(),
});

export const brokerLeadSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().trim().email('Please enter a valid email address'),
  phone: safePhone.optional().nullable(),
  message: z.string().trim().max(1000).optional().nullable(),
  source: z.string().trim().max(50).optional().nullable(),
});

export const compareBrokersSchema = z
  .object({
    brokerIds: z
      .union([
        z.array(z.string()),
        z.string().transform((val) => val.split(',').map((s) => s.trim()).filter(Boolean)),
      ])
      .optional(),
    ids: z
      .union([
        z.array(z.string()),
        z.string().transform((val) => val.split(',').map((s) => s.trim()).filter(Boolean)),
      ])
      .optional(),
  })
  .refine(
    (data) => {
      const list = data.brokerIds || data.ids;
      return Array.isArray(list) && list.length >= 2 && list.length <= 4;
    },
    { message: 'Select between 2 and 4 brokers to compare' }
  );

// Legacy schema kept for backward compatibility if needed
export const registerBrokerSchema = generalSectionSchema.partial();
export const updateBrokerSchema = generalSectionSchema.partial();
