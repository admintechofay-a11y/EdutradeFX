import { z } from 'zod';
import { SignalDirection, SignalStatus } from '@prisma/client';

export const registerSPSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(80),
  bio: z.string().min(10).max(3000).optional(),
  instruments: z.array(z.string()).min(1, 'Please specify at least one traded instrument/pair').or(
    z.string().transform((s) => s.split(',').map((x) => x.trim()).filter(Boolean))
  ),
  strategy: z.string().min(2, 'Trading strategy is required').max(100),
  riskCategory: z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']).default('MEDIUM'),
  seoTitle: z.string().max(100).optional(),
  seoDescription: z.string().max(250).optional(),
});

export const updateSPSchema = registerSPSchema.partial();

export const signalSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
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
