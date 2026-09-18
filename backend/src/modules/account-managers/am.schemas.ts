import { z } from 'zod';

export const registerAMSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  tagline: z.string().min(5).max(150).optional(),
  bio: z.string().min(10).max(3000).optional(),
  expertise: z.array(z.string()).min(1, 'Please specify at least one area of expertise').or(
    z.string().transform((s) => s.split(',').map((x) => x.trim()).filter(Boolean))
  ),
  languages: z.array(z.string()).min(1, 'Please specify spoken languages').or(
    z.string().transform((s) => s.split(',').map((x) => x.trim()).filter(Boolean))
  ),
  country: z.string().min(2, 'Country is required'),
  city: z.string().optional(),
  yearsExperience: z.coerce.number().int().min(0).max(50).optional(),
  services: z.array(z.string()).min(1, 'Please specify services offered').or(
    z.string().transform((s) => s.split(',').map((x) => x.trim()).filter(Boolean))
  ),
  availability: z.string().max(100).optional(),
  seoTitle: z.string().max(100).optional(),
  seoDescription: z.string().max(250).optional(),
});

export const updateAMSchema = registerAMSchema.partial();

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
