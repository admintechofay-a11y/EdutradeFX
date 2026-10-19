import { z } from 'zod';
import { normalizeToE164 } from '../../utils/phone.utils';

// Helper to strip HTML tags and reject null / control characters
export function sanitizePlainText(val?: string | null): string {
  if (!val || typeof val !== 'string') return '';
  return val
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // remove control chars
    .trim();
}

const safeText = (min = 0, max = 5000) =>
  z
    .string()
    .transform((val) => sanitizePlainText(val))
    .refine((val) => (min > 0 ? val.length >= min : true), {
      message: `Must be at least ${min} characters`,
    })
    .refine((val) => val.length <= max, {
      message: `Must be at most ${max} characters`,
    });

// Social URL validation allow-lists
const isValidUrlDomain = (url: string, allowedDomains: string[]): boolean => {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    const hostname = parsed.hostname.toLowerCase();
    return allowedDomains.some((d) => hostname === d || hostname.endsWith(`.${d}`));
  } catch {
    return false;
  }
};

const sanitizeSocialHandleOrUrl = (
  val: string | undefined | null,
  allowedDomains: string[]
): string | undefined => {
  if (!val) return undefined;
  const cleaned = sanitizePlainText(val);
  if (!cleaned) return undefined;

  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    if (!isValidUrlDomain(cleaned, allowedDomains)) {
      throw new Error(`URL must be an https link on allowed domains: ${allowedDomains.join(', ')}`);
    }
    return cleaned;
  }

  // Handle username (strip leading @)
  return cleaned.replace(/^@/, '');
};

// ── 1. PERSONAL / CORPORATE SCHEMA ──────────────────────────────
export const personalSchema = z
  .object({
    entityType: z.enum(['INDIVIDUAL', 'CORPORATE']).default('INDIVIDUAL'),
    companyLegalName: safeText(0, 100).optional(),
    companyRegistrationNumber: safeText(0, 60).optional(),
    incorporationCountry: safeText(0, 60).optional(),
    companyWebsite: z
      .string()
      .optional()
      .refine(
        (url) => !url || url.trim() === '' || /^https?:\/\/.+/.test(url.trim()),
        'Website must be a valid URL starting with http:// or https://'
      ),
    address: safeText(0, 200).optional(),
    country: safeText(0, 100).optional(),
    countryCode: z.string().max(2).optional(),
    stateRegion: safeText(0, 100).optional(),
    stateCode: safeText(0, 20).optional(),
    city: safeText(0, 80).optional(),
    zipCode: z
      .string()
      .optional()
      .refine(
        (z) => !z || /^[a-zA-Z0-9\s-]{3,12}$/.test(z.trim()),
        'Zip/Postal code must be 3-12 alphanumeric characters'
      ),
    contactEmail: z
      .string()
      .optional()
      .refine((e) => !e || z.string().email().safeParse(e.toLowerCase().trim()).success, 'Invalid email address')
      .transform((e) => (e ? e.toLowerCase().trim() : undefined)),
    contactPhone: z
      .string()
      .optional()
      .refine(
        (p) => !p || normalizeToE164(p) !== null,
        'Phone number must be a valid phone number with country code'
      )
      .transform((p) => (p ? normalizeToE164(p) || p : undefined)),
    socialLinks: z
      .object({
        youtube: z.string().optional(),
        instagram: z.string().optional(),
        linkedin: z.string().optional(),
        discord: z.string().optional(),
        facebook: z.string().optional(),
        twitter: z.string().optional(),
      })
      .optional()
      .transform((links) => {
        if (!links) return {};
        const normalized: Record<string, string> = {};
        if (links.youtube) {
          normalized.youtube = sanitizeSocialHandleOrUrl(links.youtube, ['youtube.com', 'youtu.be']) || '';
        }
        if (links.instagram) {
          normalized.instagram = sanitizeSocialHandleOrUrl(links.instagram, ['instagram.com']) || '';
        }
        if (links.linkedin) {
          normalized.linkedin = sanitizeSocialHandleOrUrl(links.linkedin, ['linkedin.com']) || '';
        }
        if (links.discord) {
          normalized.discord = sanitizeSocialHandleOrUrl(links.discord, ['discord.gg', 'discord.com']) || '';
        }
        if (links.facebook) {
          normalized.facebook = sanitizeSocialHandleOrUrl(links.facebook, ['facebook.com', 'fb.com']) || '';
        }
        if (links.twitter) {
          normalized.twitter = sanitizeSocialHandleOrUrl(links.twitter, ['x.com', 'twitter.com']) || '';
        }
        return normalized;
      }),
    socialLinksPublic: z.boolean().optional().default(false),
  })
  .strip();

// ── 2. REGULATORY SCHEMA ─────────────────────────────────────────
export const regulatorySchema = z
  .object({
    isRegulated: z.boolean().optional(),
    regulatorName: safeText(0, 100).optional(),
    regulatorRegistrationNumber: safeText(0, 60).optional(),
    regulatorCountry: safeText(0, 60).optional(),
  })
  .strip();

// ── 3. ABOUT TRADER SCHEMA ───────────────────────────────────────
export const aboutSchema = z
  .object({
    tagline: safeText(0, 150).optional(),
    bio: safeText(0, 3000).optional(),
    speciality: safeText(0, 1500).optional(),
  })
  .strip();

// ── 4. MARKET EXPERIENCE SCHEMA ──────────────────────────────────
export const experienceSchema = z
  .object({
    yearsExperience: z.coerce.number().int().min(0).max(60).optional(),
    marketEventExperience: safeText(0, 2000).optional(),
  })
  .strip();

// ── 5. TRADING STYLE SCHEMA ──────────────────────────────────────
export const styleSchema = z
  .object({
    preferredInstruments: z.array(z.string()).max(10).optional().default([]),
    tradingStyles: z
      .array(
        z.enum([
          'DAY_TRADER',
          'SWING_TRADER',
          'SCALPER',
          'POSITION_TRADER',
          'NEWS_TRADER',
          'ALGORITHMIC_TRADER',
        ])
      )
      .optional()
      .default([]),
    accuracyLevel: z.coerce.number().min(0).max(100).optional().nullable(),
    accuracyPeriodNote: safeText(0, 120).optional().nullable(),
    preferredPlatforms: z.array(z.string()).optional().default([]),
    otherPlatformName: safeText(0, 60).optional().nullable(),
    preferredBrokerTypes: z.array(z.string()).optional().default([]),
  })
  .strip();

// ── 6. TRADING STRATEGY SCHEMA ───────────────────────────────────
export const strategySchema = z
  .object({
    indicators: safeText(0, 1500).optional().nullable(),
    signals: safeText(0, 200).optional().nullable(),
    fundamentals: safeText(0, 1500).optional().nullable(),
    technical: safeText(0, 1500).optional().nullable(),
    newsTrade: safeText(0, 1500).optional().nullable(),
  })
  .strip();

// ── 7. RISK APPETITE SCHEMA ──────────────────────────────────────
export const riskSchema = z
  .object({
    riskRewardRatio: z
      .string()
      .optional()
      .nullable()
      .refine(
        (val) => !val || /^\d+(\.\d+)?:(\d+(\.\d+)?)$/.test(val.trim()),
        'Risk-reward ratio must match pattern A:B (e.g. 1:2 or 1:2.5)'
      ),
    riskTolerance: z.enum(['LOW', 'MODERATE', 'HIGH']).optional().nullable(),
    lossPerTradePercent: z.coerce.number().min(0.01).max(100).optional().nullable(),
    dailyTrades: z.coerce.number().int().min(1).max(500).optional().nullable(),
    dailyLots: z.coerce.number().min(0.01).max(1000).optional().nullable(),
    dailyStopLossPoints: z.coerce.number().int().min(1).optional().nullable(),
    dailyTakeProfitPoints: z.coerce.number().int().min(1).optional().nullable(),
    favouriteTimeframe: z.string().optional().nullable(),
    tradingTimeFrom: z
      .string()
      .optional()
      .nullable()
      .refine((t) => !t || /^\d{2}:\d{2}$/.test(t), 'Time must be in HH:mm 24-hour format'),
    tradingTimeTo: z
      .string()
      .optional()
      .nullable()
      .refine((t) => !t || /^\d{2}:\d{2}$/.test(t), 'Time must be in HH:mm 24-hour format'),
    lossRecoveryStrategy: safeText(0, 2000).optional().nullable(),
  })
  .strip();

// ── 8. CLIENT SETTLEMENTS SCHEMA ─────────────────────────────────
export const settlementSchema = z
  .object({
    settlementCycle: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).optional().nullable(),
  })
  .strip();

// ── 9. SHARING & SETTLEMENTS SCHEMA ──────────────────────────────
export const sharingSchema = z
  .object({
    clientFundSecurity: safeText(0, 2000).optional().nullable(),
    recommendsBroker: z.boolean().optional().nullable(),
    recommendedBrokerId: z.string().optional().nullable(),
    recommendedBrokerName: safeText(0, 100).optional().nullable(),
    recommendedBrokerPlatform: safeText(0, 100).optional().nullable(),
    profitSharingPercent: z.coerce.number().min(0).max(100).optional().nullable(),
    lossSharingPercent: z.coerce.number().min(0).max(100).optional().nullable(),
  })
  .strip();

// ── 10. AGREEMENT ACCEPTANCE SCHEMA ──────────────────────────────
export const acceptAgreementsSchema = z
  .object({
    acceptances: z
      .array(
        z.object({
          key: z.string(),
          version: z.number().int().min(1),
        })
      )
      .min(1, 'At least one agreement acceptance is required'),
    master: z.boolean().refine((val) => val === true, 'You must accept the EdutradeFX Platform Terms'),
  })
  .strip();

// ── FULL SUBMIT GATE SCHEMA ──────────────────────────────────────
export const amSubmitSchema = z
  .object({
    entityType: z.enum(['INDIVIDUAL', 'CORPORATE']),
    companyLegalName: z.string().optional(),
    companyRegistrationNumber: z.string().optional(),
    incorporationCountry: z.string().optional(),
    photo: z.string().min(1, 'Profile photo is required'),
    address: z.string().min(5, 'Address must be at least 5 characters').max(200),
    country: z.string().min(2, 'Country is required'),
    countryCode: z.string().min(2, 'Country code is required'),
    stateRegion: z.string().min(2, 'State or region is required'),
    city: z.string().min(2, 'City is required').max(80),
    zipCode: z.string().min(3, 'Zip/Postal code is required').max(12),
    contactEmail: z.string().email('Valid contact email is required'),
    contactPhone: z.string().min(7, 'Valid contact phone number in E.164 format is required'),
    isRegulated: z.boolean(),
    regulatorName: z.string().optional(),
    regulatorRegistrationNumber: z.string().optional(),
    regulatorCountry: z.string().optional(),
    bio: z.string().min(50, 'Bio must be at least 50 characters').max(3000),
    speciality: z.string().min(20, 'Speciality must be at least 20 characters').max(1500),
    yearsExperience: z.coerce.number().int().min(0, 'Years of experience must be 0 or greater').max(60),
    tradingStyles: z.array(z.string()).min(1, 'Please select at least one trading style'),
    preferredPlatforms: z.array(z.string()).min(1, 'Please select at least one platform'),
    otherPlatformName: z.string().optional(),
    preferredBrokerTypes: z.array(z.string()).min(1, 'Please select at least one broker type'),
    indicators: z.string().min(1, 'Trading indicators are required').max(1500),
    technical: z.string().min(1, 'Technical analysis details are required').max(1500),
    riskRewardRatio: z
      .string()
      .min(1, 'Risk-reward ratio is required')
      .refine((val) => /^\d+(\.\d+)?:(\d+(\.\d+)?)$/.test(val.trim()), 'Format must be A:B (e.g. 1:2)'),
    riskTolerance: z.enum(['LOW', 'MODERATE', 'HIGH']),
    lossPerTradePercent: z.coerce.number().min(0.01).max(100),
    dailyTrades: z.coerce.number().int().min(1).max(500),
    dailyLots: z.coerce.number().min(0.01).max(1000),
    dailyStopLossPoints: z.coerce.number().int().min(1),
    dailyTakeProfitPoints: z.coerce.number().int().min(1),
    favouriteTimeframe: z.string().min(1, 'Favourite timeframe is required'),
    tradingTimeFrom: z.string().regex(/^\d{2}:\d{2}$/, 'Valid trading start time is required'),
    tradingTimeTo: z.string().regex(/^\d{2}:\d{2}$/, 'Valid trading end time is required'),
    lossRecoveryStrategy: z.string().min(20, 'Loss recovery strategy must be at least 20 characters').max(2000),
    settlementCycle: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
    clientFundSecurity: z.string().min(30, 'Client fund security description must be at least 30 characters').max(2000),
    recommendsBroker: z.boolean(),
    recommendedBrokerName: z.string().optional(),
    recommendedBrokerPlatform: z.string().optional(),
    profitSharingPercent: z.coerce.number().min(0).max(100),
    lossSharingPercent: z.coerce.number().min(0).max(100),
  })
  .superRefine((data, ctx) => {
    // Corporate conditional checks
    if (data.entityType === 'CORPORATE') {
      if (!data.companyLegalName || data.companyLegalName.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['companyLegalName'],
          message: 'Company legal name is required for corporate account managers',
        });
      }
      if (!data.companyRegistrationNumber || data.companyRegistrationNumber.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['companyRegistrationNumber'],
          message: 'Company registration number is required for corporate account managers',
        });
      }
      if (!data.incorporationCountry || data.incorporationCountry.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['incorporationCountry'],
          message: 'Country of incorporation is required for corporate account managers',
        });
      }
    }

    // Regulated conditional checks
    if (data.isRegulated) {
      if (!data.regulatorName || data.regulatorName.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['regulatorName'],
          message: 'Regulator name is required when registered with a financial authority',
        });
      }
      if (!data.regulatorRegistrationNumber || data.regulatorRegistrationNumber.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['regulatorRegistrationNumber'],
          message: 'Regulator license/registration number is required',
        });
      }
      if (!data.regulatorCountry || data.regulatorCountry.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['regulatorCountry'],
          message: 'Regulator jurisdiction/country is required',
        });
      }
    }

    // Platform OTHER check
    if (data.preferredPlatforms.includes('OTHER')) {
      if (!data.otherPlatformName || data.otherPlatformName.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['otherPlatformName'],
          message: 'Please specify the name of your other trading platform',
        });
      }
    }

    // Trading times check
    if (data.tradingTimeFrom === data.tradingTimeTo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tradingTimeTo'],
        message: 'Trading start time and end time cannot be identical',
      });
    }

    // Broker recommendation conditional check
    if (data.recommendsBroker) {
      if (!data.recommendedBrokerName || data.recommendedBrokerName.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['recommendedBrokerName'],
          message: 'Please specify the recommended broker name',
        });
      }
      if (!data.recommendedBrokerPlatform || data.recommendedBrokerPlatform.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['recommendedBrokerPlatform'],
          message: 'Please specify the recommended broker platform',
        });
      }
    }
  });

// ── REVIEWS & ENQUIRIES ──────────────────────────────────────────
export const amReviewSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(20, 'Review comment must be at least 20 characters').max(2000),
});

export const amEnquirySchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  phone: z.string().max(25).optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
});

// Backward-compatible wrappers
export const registerAMSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    tagline: z.string().min(5).max(150).optional(),
    bio: z.string().min(10).max(3000).optional(),
    expertise: z
      .array(z.string())
      .min(1)
      .or(z.string().transform((s) => s.split(',').map((x) => x.trim()).filter(Boolean)))
      .optional(),
    languages: z
      .array(z.string())
      .min(1)
      .or(z.string().transform((s) => s.split(',').map((x) => x.trim()).filter(Boolean)))
      .optional(),
    country: z.string().min(2).optional(),
    city: z.string().optional(),
    yearsExperience: z.coerce.number().int().min(0).max(60).optional(),
    services: z
      .array(z.string())
      .min(1)
      .or(z.string().transform((s) => s.split(',').map((x) => x.trim()).filter(Boolean)))
      .optional(),
    availability: z.string().max(100).optional(),
    seoTitle: z.string().max(100).optional(),
    seoDescription: z.string().max(250).optional(),
  })
  .strip();

export const updateAMSchema = registerAMSchema.partial();
