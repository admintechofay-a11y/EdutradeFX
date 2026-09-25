import { z } from 'zod';

const currentYear = new Date().getFullYear();

export const registerBrokerSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters').max(100),
  website: z.string().url('Please enter a valid website URL').optional().or(z.literal('')),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  yearFounded: z.coerce.number().int().min(1900).max(currentYear).optional(),
  headquarters: z.string().max(150).optional(),
  countries: z.array(z.string()).min(1, 'Please specify at least one supported country').or(
    z.string().transform((str) => str.split(',').map((s) => s.trim()).filter(Boolean))
  ),
  regulation: z.array(z.string()).min(1, 'Please specify at least one regulatory body').or(
    z.string().transform((str) => str.split(',').map((s) => s.trim()).filter(Boolean))
  ),
  tradingPlatforms: z.array(z.string()).min(1, 'Please specify at least one trading platform').or(
    z.string().transform((str) => str.split(',').map((s) => s.trim()).filter(Boolean))
  ),
  accountTypes: z.array(z.string()).min(1, 'Please specify at least one account type').or(
    z.string().transform((str) => str.split(',').map((s) => s.trim()).filter(Boolean))
  ),
  minDeposit: z.coerce.number().nonnegative().optional(),
  maxLeverage: z.string().max(50).optional(),
  spreadsFrom: z.string().max(50).optional(),
  commissions: z.string().max(100).optional(),
  instruments: z.array(z.string()).min(1, 'Please specify available instruments').or(
    z.string().transform((str) => str.split(',').map((s) => s.trim()).filter(Boolean))
  ),
  depositMethods: z.array(z.string()).min(1, 'Please specify deposit methods').or(
    z.string().transform((str) => str.split(',').map((s) => s.trim()).filter(Boolean))
  ),
  withdrawMethods: z.array(z.string()).min(1, 'Please specify withdrawal methods').or(
    z.string().transform((str) => str.split(',').map((s) => s.trim()).filter(Boolean))
  ),
  seoTitle: z.string().max(100).optional(),
  seoDescription: z.string().max(250).optional(),
});

export const updateBrokerSchema = registerBrokerSchema.partial();

export const brokerReviewSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  title: z.string().min(3, 'Review title must be at least 3 characters').max(100),
  comment: z.string().min(20, 'Comment must be at least 20 characters').max(2000),
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
