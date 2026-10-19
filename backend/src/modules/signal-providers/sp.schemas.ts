import { z } from 'zod';
import { SignalDirection, SignalStatus, SpUpdateFrequency, SpSubscriptionModel, SpPlanPeriod, StatementAccountType } from '@prisma/client';

export const PERFORMANCE_LINK_DOMAINS = [
  'mql5.com',
  'myfxbook.com',
  'fxblue.com',
  'tradingview.com',
  'zulutrade.com',
  'fxstreet.com',
  'signalstart.com',
  'darwinex.com',
];

export function detectPerformancePlatform(urlStr?: string | null): string | null {
  if (!urlStr) return null;
  try {
    const url = new URL(urlStr);
    const host = url.hostname.toLowerCase();
    for (const d of PERFORMANCE_LINK_DOMAINS) {
      if (host.includes(d)) return d;
    }
    return 'OTHER';
  } catch {
    return null;
  }
}

// ── RED FLAG PHRASES (Client funds & profit sharing prohibition) ─
export const SUSPICIOUS_PHRASES = [
  'send me funds',
  'manage your account',
  'profit share',
  'profit sharing',
  'guaranteed profit',
  'guaranteed return',
  'send money',
  'give me capital',
  'pamm',
  'mam account',
  'pass my prop',
  'account management',
];

export function scanSuspiciousPhrases(textObj: Record<string, any>): string[] {
  const flags: string[] = [];
  const combinedText = Object.values(textObj)
    .filter((v) => typeof v === 'string')
    .join(' ')
    .toLowerCase();

  for (const phrase of SUSPICIOUS_PHRASES) {
    if (combinedText.includes(phrase)) {
      flags.push(`Free text contains prohibited client-fund or profit-sharing phrase: "${phrase}"`);
    }
  }
  return flags;
}

// ── SECTION 1: PERSONAL INFORMATION ────────────────────────
export const personalSchema = z.object({
  legalFullName: z.string().min(2, 'Legal full name must be at least 2 characters').max(100),
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(80),
  contactPhone: z.string().regex(/^\+[1-9]\d{6,14}$/, 'Phone must be in international E.164 format (e.g. +12125550199)'),
  residenceCountryCode: z.string().min(2).max(3),
  residenceCountry: z.string().min(2, 'Country of residence is required').max(100),
  bio: z.string().max(3000).optional().nullable(),
  photo: z.string().url().optional().nullable(),
}).strip();

// ── SECTION 2: TRADING EXPERIENCE ───────────────────────────
export const experienceBaseSchema = z.object({
  yearsTrading: z.coerce.number().int().min(0, 'Years trading must be 0 or more').max(60, 'Years trading cannot exceed 60'),
  instruments: z.array(z.string()).min(1, 'Select at least one preferred trading instrument').max(15, 'Maximum 15 instruments allowed'),
  tradingStyles: z.array(z.string()).min(1, 'Select at least one trading style'),
  tradingStyleDescription: z.string().min(50, 'Please describe your trading style (minimum 50 characters)').max(1500),
  previouslySignalProvider: z.boolean(),
  previousProviderDetails: z.string().max(500).optional().nullable(),
}).strip();

export const experienceSchema = experienceBaseSchema.refine((data) => {
  if (data.previouslySignalProvider && (!data.previousProviderDetails || data.previousProviderDetails.trim().length < 10)) {
    return false;
  }
  return true;
}, {
  message: 'Please provide details of your previous signal provider platforms/experience (minimum 10 characters).',
  path: ['previousProviderDetails'],
});

// ── SECTION 3: PERFORMANCE METRICS (Self-declared) ─────────
export const performanceSchema = z.object({
  declaredAvgMonthlyReturn: z.coerce.number().min(-100, 'Monthly return cannot be less than -100%').max(1000, 'Monthly return cannot exceed 1000%'),
  declaredMaxDrawdown: z.coerce.number().min(0, 'Max drawdown cannot be negative').max(100, 'Max drawdown cannot exceed 100%'),
  declaredWinRate: z.coerce.number().min(0, 'Win rate cannot be negative').max(100, 'Win rate cannot exceed 100%'),
  preferredTimeframes: z.array(z.string()).min(1, 'Select at least one preferred timeframe').max(3, 'Maximum 3 preferred timeframes allowed'),
  maxConsecutiveLosses: z.coerce.number().int().min(0).max(500),
  performancePeriodNote: z.string().max(150).optional().nullable(),
}).strip();

// ── SECTION 4: RISK MANAGEMENT ─────────────────────────────
export const riskBaseSchema = z.object({
  maxLeverageUsed: z.coerce.number().int().min(1, 'Leverage must be at least 1:1').max(3000, 'Leverage cannot exceed 1:3000'),
  riskRewardPreference: z.string().regex(/^\d+(\.\d+)?:(\d+(\.\d+)?)$/, 'Risk reward must be in format 1:N (e.g., 1:2 or 1:2.5)'),
  riskRewardValue: z.number().optional().nullable(),
  riskPhilosophy: z.string().min(50, 'Risk management philosophy must be at least 50 characters').max(2000),
  usesHedgingOrMartingale: z.boolean(),
  usesHedging: z.boolean().default(false),
  usesMartingale: z.boolean().default(false),
  hedgingMartingaleNotes: z.string().max(1000).optional().nullable(),
  riskCategory: z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']),
}).strip();

export const riskSchema = riskBaseSchema.refine((data) => {
  if (data.usesHedgingOrMartingale) {
    if (!data.usesHedging && !data.usesMartingale) return false;
    if (!data.hedgingMartingaleNotes || data.hedgingMartingaleNotes.trim().length < 30) return false;
  }
  return true;
}, {
  message: 'When selecting Yes for hedging/martingale, specify whether you use hedging or martingale and provide details (min 30 characters).',
  path: ['hedgingMartingaleNotes'],
});

// ── SECTION 5: VERIFICATION ─────────────────────────────────
export const verificationBaseSchema = z.object({
  performanceLink: z.string().url().optional().nullable().refine((url) => {
    if (!url) return true;
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:') return false;
      const host = parsed.hostname.toLowerCase();
      return PERFORMANCE_LINK_DOMAINS.some((d) => host.includes(d));
    } catch {
      return false;
    }
  }, {
    message: 'Performance link must be https and from an authorized platform (e.g. mql5.com, myfxbook.com, fxblue.com, tradingview.com)',
  }),
  statementPeriodFrom: z.string().or(z.date()).optional().nullable(),
  statementPeriodTo: z.string().or(z.date()).optional().nullable(),
  statementAccountType: z.nativeEnum(StatementAccountType).optional().nullable(),
}).strip();

export const verificationSchema = verificationBaseSchema.refine((data) => {
  if (data.statementPeriodFrom && data.statementPeriodTo) {
    const from = new Date(data.statementPeriodFrom).getTime();
    const to = new Date(data.statementPeriodTo).getTime();
    const now = Date.now();
    if (to > now) return false;
    const diffDays = (to - from) / (1000 * 60 * 60 * 24);
    if (diffDays < 85) return false;
    const daysSinceTo = (now - to) / (1000 * 60 * 60 * 24);
    if (daysSinceTo > 45) return false;
  }
  return true;
}, {
  message: 'Statement period must span at least 85 days ("last 3 months"), end within the last 45 days, and not be in the future.',
  path: ['statementPeriodTo'],
});

// ── SECTION 7: ADDITIONAL INFORMATION ───────────────────────
export const additionalSchema = z.object({
  strategy: z.string().min(2, 'Strategy headline is required').max(100),
  strategyDetail: z.string().min(100, 'Detailed trading strategy must be at least 100 characters').max(5000),
  specializedExpertise: z.string().max(1500).optional().nullable(),
  marketAdaptation: z.string().min(50, 'Market adaptation description must be at least 50 characters').max(2000),
  uniqueValue: z.string().min(50, 'Unique value proposition must be at least 50 characters').max(1500),
}).strip();

// ── SECTION 8: INVESTOR COMMUNICATION ───────────────────────
export const communicationBaseSchema = z.object({
  updateFrequency: z.nativeEnum(SpUpdateFrequency),
  inquiryHandlingApproach: z.string().min(30, 'Inquiry handling approach must be at least 30 characters').max(1500),
  offersLiveQA: z.boolean(),
  liveQAFrequency: z.string().max(100).optional().nullable(),
  website: z.string().url().optional().nullable(),
  telegramChannelUrl: z.string().url().optional().nullable().refine((url) => {
    if (!url) return true;
    try {
      const parsed = new URL(url);
      return parsed.hostname.includes('t.me') || parsed.hostname.includes('telegram.me');
    } catch {
      return false;
    }
  }, {
    message: 'Telegram link must be a valid t.me or telegram.me URL',
  }),
}).strip();

export const communicationSchema = communicationBaseSchema.refine((data) => {
  if (data.offersLiveQA && (!data.liveQAFrequency || data.liveQAFrequency.trim().length === 0)) {
    return false;
  }
  return true;
}, {
  message: 'Please specify your live Q&A or webinar frequency.',
  path: ['liveQAFrequency'],
});

// ── SECTION: PLANS & PRICING ────────────────────────────────
export const planItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Plan name must be at least 2 characters').max(50),
  period: z.nativeEnum(SpPlanPeriod),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  currency: z.string().default('USD'),
  description: z.string().max(300).optional().nullable(),
  sortOrder: z.number().int().optional().default(0),
});

export const pricingBaseSchema = z.object({
  subscriptionModel: z.nativeEnum(SpSubscriptionModel),
  plans: z.array(planItemSchema).max(5, 'Maximum 5 subscription plans allowed').optional(),
}).strip();

export const pricingSchema = pricingBaseSchema.refine((data) => {
  if (data.subscriptionModel === SpSubscriptionModel.PAID) {
    if (!data.plans || data.plans.length === 0) return false;
  }
  return true;
}, {
  message: 'Paid subscription model requires at least one defined membership plan.',
  path: ['plans'],
});

// ── AGREEMENTS ACCEPTANCE ───────────────────────────────────
export const acceptAgreementsSchema = z.object({
  acceptances: z.array(
    z.object({
      key: z.string(),
      version: z.number().int().positive(),
    })
  ).min(1, 'At least one agreement acceptance is required'),
});

// ── FULL SUBMIT VALIDATION ──────────────────────────────────
export const spSubmitSchema = z.object({
  legalFullName: z.string().min(2).max(100),
  displayName: z.string().min(2).max(80),
  contactPhone: z.string().min(5),
  residenceCountryCode: z.string().min(2),
  residenceCountry: z.string().min(2),
  yearsTrading: z.coerce.number().int().min(0).max(60),
  instruments: z.array(z.string()).min(1),
  tradingStyles: z.array(z.string()).min(1),
  tradingStyleDescription: z.string().min(50),
  previouslySignalProvider: z.boolean(),
  declaredAvgMonthlyReturn: z.any().refine((v) => v !== null && v !== undefined, 'Declared average monthly return is required'),
  declaredMaxDrawdown: z.any().refine((v) => v !== null && v !== undefined, 'Declared max drawdown is required'),
  declaredWinRate: z.any().refine((v) => v !== null && v !== undefined, 'Declared win rate is required'),
  preferredTimeframes: z.array(z.string()).min(1),
  maxConsecutiveLosses: z.any().refine((v) => v !== null && v !== undefined, 'Max consecutive losses is required'),
  maxLeverageUsed: z.coerce.number().int().min(1),
  riskRewardPreference: z.string().min(3),
  riskPhilosophy: z.string().min(50),
  usesHedgingOrMartingale: z.boolean(),
  riskCategory: z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']),
  strategy: z.string().min(2).max(100),
  strategyDetail: z.string().min(100),
  marketAdaptation: z.string().min(50),
  uniqueValue: z.string().min(50),
  updateFrequency: z.nativeEnum(SpUpdateFrequency),
  inquiryHandlingApproach: z.string().min(30),
  offersLiveQA: z.boolean(),
  subscriptionModel: z.nativeEnum(SpSubscriptionModel),
  declarationAcceptedAt: z.any().refine((v) => v !== null && v !== undefined, 'Declaration must be accepted before submission'),
}).strip();

// ── LEGACY & COMPATIBILITY SCHEMAS ──────────────────────────
export const registerSPSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(80),
  bio: z.string().max(3000).optional(),
  instruments: z.array(z.string()).min(1, 'Please specify at least one traded instrument').or(
    z.string().transform((s) => s.split(',').map((x) => x.trim()).filter(Boolean))
  ),
  strategy: z.string().min(2).max(100),
  riskCategory: z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']).optional(),
  seoTitle: z.string().max(100).optional(),
  seoDescription: z.string().max(250).optional(),
}).strip();

export const updateSPSchema = z.object({
  displayName: z.string().min(2).max(80).optional(),
  bio: z.string().max(3000).optional(),
  strategy: z.string().max(100).optional(),
  strategyDetail: z.string().max(5000).optional(),
  yearsTrading: z.coerce.number().int().min(0).max(60).optional(),
  tradingStyles: z.array(z.string()).optional(),
  tradingStyleDescription: z.string().max(1500).optional(),
  telegramChannelUrl: z.string().url().optional().nullable(),
  instruments: z.array(z.string()).optional(),
  riskCategory: z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']).optional(),
  seoTitle: z.string().max(100).optional(),
  seoDescription: z.string().max(250).optional(),
}).strip();

export const signalSchema = z.object({
  title: z.string().max(100).optional(),
  instrument: z.string().min(2, 'Trading instrument (e.g., EUR/USD, XAU/USD) is required'),
  direction: z.nativeEnum(SignalDirection),
  entryPrice: z.coerce.number().positive().optional(),
  takeProfit: z.coerce.number().positive().optional(),
  stopLoss: z.coerce.number().positive().optional(),
  description: z.string().max(2000).optional(),
});

export const updateSignalSchema = z.object({
  status: z.nativeEnum(SignalStatus).optional(),
  closedPrice: z.coerce.number().positive().optional(),
  pipsGained: z.coerce.number().optional(),
  description: z.string().max(2000).optional(),
});

export const spReviewSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(20, 'Comment must be at least 20 characters').max(2000),
});

export const spEnquirySchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  phone: z.string().max(25).optional(),
  message: z.string().min(10).max(1000),
});
