import { z } from 'zod';
import { AdPlacement } from '@prisma/client';

export const createAdSchema = z
  .object({
    title: z.string().min(3).max(100),
    linkUrl: z.string().url('Please enter a valid link URL'),
    placement: z.nativeEnum(AdPlacement),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    brokerId: z.string().uuid().optional().or(z.literal('')),
    courseId: z.string().uuid().optional().or(z.literal('')),
    isActive: z.preprocess((v) => v === 'true' || v === true, z.boolean().default(true)),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

export const updateAdSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  linkUrl: z.string().url().optional(),
  placement: z.nativeEnum(AdPlacement).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  brokerId: z.string().uuid().optional().or(z.literal('')),
  courseId: z.string().uuid().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});
