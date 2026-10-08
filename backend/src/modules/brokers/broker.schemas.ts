import { z } from 'zod';
import {
  BrokerBusinessType,
  BrokerDocType,
  SpreadType,
  OrderExecution,
  GtcMode,
  IbSettlement,
} from '@prisma/client';

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

const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{4,20}$/;
export const safePhone = z.string().trim().regex(phoneRegex, 'Please enter a valid phone number');

// ─── SECTION 1: General Information ──────────────────
export const generalSectionSchema = z
  .object({
    registeredName: z.string().max(150).optional().nullable(),
    companyName: z.string().min(2, 'Company name must be at least 2 characters').max(100),
    businessType: z.nativeEnum(BrokerBusinessType).optional().nullable(),
    address: z.string().max(500).optional().nullable(),
    city: z.string().max(100).optional().nullable(),
    state: z.string().max(100).optional().nullable(),
    postalCode: z.string().max(30).optional().nullable(),
    country: z.string().max(100).optional().nullable(),
    website: safeOptionalUrl,
    phone: z.union([safePhone, z.literal('')]).optional().nullable(),
    email: z.union([z.string().email(), z.literal('')]).optional().nullable(),
    yearFounded: z.coerce.number().int().min(1900).max(currentYear).optional().nullable(),
    mtRegisteredCountryRegion: z.string().max(150).optional().nullable(),
    isRegulated: z.boolean().optional().nullable(),
    totalTradableSymbols: z.coerce.number().int().nonnegative().max(50000).optional().nullable(),
    accountCurrencies: z.array(z.string().max(10)).max(50).default([]),
    negativeBalanceProtection: z.boolean().optional().nullable(),
  })
  .strict();

// ─── SECTION 2: Devices, Platforms & Servers ─────────
export const serverItemSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().min(1, 'Server name required').max(100),
    ip: z.string().max(100).optional().nullable(),
    location: z.string().max(100).optional().nullable(),
    sortOrder: z.coerce.number().int().default(0),
  })
  .strict();

export const devicesServersSectionSchema = z
  .object({
    platformDescription: z.string().max(5000).optional().nullable(),
    availablePlatforms: z.array(z.string().max(50)).max(20).default([]),
    platformLinks: z.record(z.string(), z.string()).optional().nullable(),
    deviceSupport: z.array(z.string().max(50)).max(20).default([]),
    servers: z.array(serverItemSchema).max(50).default([]),
  })
  .strict();

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
  .strict();

export const regulatorySectionSchema = z
  .object({
    isRegulated: z.boolean().optional().nullable(),
    licenses: z.array(licenseItemSchema).max(30).default([]),
  })
  .strict();

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
  .strict();

export const boardSectionSchema = z
  .object({
    headquarters: z.string().max(200).optional().nullable(),
    officeContactNumber: z.union([safePhone, z.literal('')]).optional().nullable(),
    officeContactEmail: z.union([z.string().email(), z.literal('')]).optional().nullable(),
    boardMembers: z.array(boardMemberItemSchema).max(30).default([]),
  })
  .strict();

// ─── SECTION 5: Services & Grievance ──────────────────
export const servicesSectionSchema = z
  .object({
    countryRestrictions: z.array(z.string().max(100)).max(200).default([]),
    supportPhone: z.union([safePhone, z.literal('')]).optional().nullable(),
    supportWhatsapp: z.union([safePhone, z.literal('')]).optional().nullable(),
    supportEmail: z.union([z.string().email(), z.literal('')]).optional().nullable(),
    supportAvailability: z.string().max(100).optional().nullable(),
    languagesSupported: z.array(z.string().max(50)).max(50).default([]),
    availableTimeframes: z.array(z.string().max(50)).max(20).default([]),
  })
  .strict();

// ─── SECTION 6: Security ──────────────────────────────
export const securitySectionSchema = z
  .object({
    clientLossPercentage: z.coerce.number().min(0).max(100).optional().nullable(),
    fundsSecurity: z.string().max(5000).optional().nullable(),
  })
  .strict();

// ─── SECTION 7: Trading Account Types ─────────────────
export const accountGroupItemSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().min(1, 'Account group name required').max(100),
    demoAvailable: z.boolean().default(false),
    currency: z.string().max(10).default('USD'),
    currencyCode: z.string().max(20).optional().nullable(),
    currencyOther: z.string().max(100).optional().nullable(),
    spreadTypesLabel: z.string().max(100).optional().nullable(),
    spreadFrom: z.coerce.number().min(0).max(1000).default(0),
    minDeposit: z.coerce.number().min(0).max(10000000).default(0),
    depositBonusPctUpTo: z.coerce.number().min(0).max(500).default(0),
    depositBonusCode: z.string().max(50).optional().nullable(),
    depositBonusNum: z.coerce.number().int().optional().nullable(),
    leverageUpTo: z.string().max(50).default('1:500'),
    leverageCode: z.string().max(50).optional().nullable(),
    leverageNum: z.coerce.number().int().optional().nullable(),
    minTradeVolume: z.coerce.number().min(0).max(1000).default(0.01),
    hasCommissionPerLot: z.boolean().default(false),
    feesPerLot: z.coerce.number().min(0).max(10000).optional().nullable(),
    commissionStructureUrl: safeOptionalUrl,
    spreadType: z.nativeEnum(SpreadType).default(SpreadType.FLOATING),
    orderTypes: z.array(z.string().max(50)).max(20).default([]),
    swapFree: z.boolean().default(false),
    swapLong: z.string().max(50).optional().nullable(),
    swapShort: z.string().max(50).optional().nullable(),
    orderExecution: z.nativeEnum(OrderExecution).default(OrderExecution.INSTANT),
    gtcMode: z.nativeEnum(GtcMode).default(GtcMode.AVAILABLE),
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
  .strict();

export const accountGroupsSectionSchema = z
  .object({
    accountGroups: z.array(accountGroupItemSchema).max(30).default([]),
  })
  .strict();

// ─── SECTION 8: IB Program ────────────────────────────
export const ibPlanItemSchema = z
  .object({
    id: z.string().uuid().optional(),
    accountGroupName: z.string().min(1, 'Account group name required').max(100),
    settlement: z.array(z.nativeEnum(IbSettlement)).max(10).default([]),
    rebatePerLot: z.coerce.number().min(0).max(10000).default(0),
    levelsUpTo: z.coerce.number().int().min(1).max(50).default(1),
    customizable: z.boolean().default(false),
    sortOrder: z.coerce.number().int().default(0),
  })
  .strict();

export const ibSectionSchema = z
  .object({
    ibPlans: z.array(ibPlanItemSchema).max(30).default([]),
  })
  .strict();

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
  .strict();

export const depositsSectionSchema = z
  .object({
    depositMethods: z.array(depositMethodItemSchema).max(50).default([]),
  })
  .strict();

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
  .strict();

export const withdrawalsSectionSchema = z
  .object({
    withdrawalMethods: z.array(withdrawalMethodItemSchema).max(50).default([]),
  })
  .strict();

// ─── SECTION 11: Traders Favorite Symbols ─────────────
export const symbolSpecItemSchema = z
  .object({
    id: z.string().uuid().optional(),
    accountGroupId: z.string().uuid().optional().nullable(),
    symbol: z.string().min(1, 'Symbol required').max(30),
    contractSize: z.string().max(50).optional().nullable(),
    digits: z.coerce.number().int().min(0).max(10).default(5),
    stopLevel: z.string().max(50).optional().nullable(),
    stopOutPct: z.string().max(50).optional().nullable(),
    commission: z.string().max(100).optional().nullable(),
    spreadType: z.string().max(50).optional().nullable(),
    spreadFrom: z.string().max(50).optional().nullable(),
    minVolume: z.coerce.number().min(0).max(1000).default(0.01),
    maxVolume: z.coerce.number().min(0).max(100000).default(100.0),
    swapLong: z.string().max(50).optional().nullable(),
    swapShort: z.string().max(50).optional().nullable(),
    sortOrder: z.coerce.number().int().default(0),
  })
  .strict();

export const symbolsSectionSchema = z
  .object({
    symbolSpecs: z.array(symbolSpecItemSchema).max(100).default([]),
  })
  .strict();

// ─── SECTION 12: Dealing ──────────────────────────────
export const dealingSectionSchema = z
  .object({
    liquidityProvider: z.string().max(250).optional().nullable(),
    personalBookSize: z.string().max(250).optional().nullable(),
  })
  .strict();

// ─── SECTION 13: Business Areas ───────────────────────
export const businessAreaItemSchema = z
  .object({
    id: z.string().uuid().optional(),
    countryOrRegion: z.string().min(1, 'Country or region required').max(150),
    clientsNote: z.string().max(1000).optional().nullable(),
    sortOrder: z.coerce.number().int().default(0),
  })
  .strict();

export const businessAreasSectionSchema = z
  .object({
    businessAreas: z.array(businessAreaItemSchema).max(50).default([]),
  })
  .strict();

// ─── SECTION 14: Funding & Activity ───────────────────
export const fundingYearItemSchema = z
  .object({
    id: z.string().uuid().optional(),
    year: z.coerce.number().int().min(1900).max(currentYear),
    netDepositUsd: z.coerce.number().min(0).default(0),
    netWithdrawUsd: z.coerce.number().min(0).default(0),
    netLots: z.coerce.number().min(0).default(0),
    sortOrder: z.coerce.number().int().default(0),
  })
  .strict();

export const fundingSectionSchema = z
  .object({
    fundingYears: z.array(fundingYearItemSchema).max(50).default([]),
  })
  .strict();

export const activitySectionSchema = z
  .object({
    avgNewClientDeposit: z.coerce.number().min(0).default(0),
    avgExistingClientDeposit: z.coerce.number().min(0).default(0),
    avgNewClientWithdrawal: z.coerce.number().min(0).default(0),
    avgExistingClientWithdrawal: z.coerce.number().min(0).default(0),
  })
  .strict();

// ─── SECTION 15: Pros & Cons ──────────────────────────
export const prosConsSectionSchema = z
  .object({
    prosList: z.array(z.string().max(250)).max(30).default([]),
    consList: z.array(z.string().max(250)).max(30).default([]),
  })
  .strict();

// ─── SECTION 16: Awards & Expos ───────────────────────
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
  .strict();

export const awardsSectionSchema = z
  .object({
    awards: z.array(awardItemSchema).max(50).default([]),
  })
  .strict();

// ─── SECTION 17: Social & Video ───────────────────────
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
  })
  .strict();

// ─── SECTION 18: Policies ─────────────────────────────
export const policyDocumentItemSchema = z
  .object({
    id: z.string().uuid().optional(),
    docType: z.nativeEnum(BrokerDocType),
    fileUrl: safeUrl,
    fileName: z.string().min(1).max(255),
    fileType: z.string().max(100).default('application/pdf'),
    isPrivate: z.boolean().default(false),
  })
  .strict();

export const policiesSectionSchema = z
  .object({
    policies: z.array(policyDocumentItemSchema).max(30).default([]),
  })
  .strict();

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
  symbols: symbolsSectionSchema,
  'symbol-specs': symbolsSectionSchema,
  dealing: dealingSectionSchema,
  'business-areas': businessAreasSectionSchema,
  funding: fundingSectionSchema,
  activity: activitySectionSchema,
  'pros-cons': prosConsSectionSchema,
  awards: awardsSectionSchema,
  social: socialSectionSchema,
  policies: policiesSectionSchema,
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
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().max(25).optional(),
  message: z.string().max(1000).optional(),
  source: z.string().max(50).optional(),
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
