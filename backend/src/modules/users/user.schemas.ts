import { z } from 'zod';
import { validatePhoneE164, normalizeToE164 } from '../../utils/phone.utils';

export const socialLinksSchema = z
  .object({
    linkedin: z.string().trim().url('Invalid LinkedIn URL').optional().or(z.literal('')),
    x: z.string().trim().url('Invalid X/Twitter URL').optional().or(z.literal('')),
    facebook: z.string().trim().url('Invalid Facebook URL').optional().or(z.literal('')),
    instagram: z.string().trim().url('Invalid Instagram URL').optional().or(z.literal('')),
    youtube: z.string().trim().url('Invalid YouTube URL').optional().or(z.literal('')),
    telegram: z.string().trim().url('Invalid Telegram URL').optional().or(z.literal('')),
    website: z.string().trim().url('Invalid Website URL').optional().or(z.literal('')),
  })
  .partial();

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80).optional(),
  phone: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((val) => !val || validatePhoneE164(val), {
      message: 'Phone number must be a valid international E.164 number with country code',
    })
    .transform((val) => (val ? normalizeToE164(val) : val)),
  whatsapp: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((val) => !val || validatePhoneE164(val), {
      message: 'WhatsApp number must be a valid international E.164 number with country code',
    })
    .transform((val) => (val ? normalizeToE164(val) : val)),
  city: z.string().trim().max(80).optional().nullable(),
  country: z.string().trim().max(80).optional().nullable(),
  bio: z.string().trim().max(1000, 'Bio cannot exceed 1000 characters').optional().nullable(),
  socialLinks: socialLinksSchema.optional().nullable(),
});
