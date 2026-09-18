import { z } from 'zod';
import { ComplaintStatus, ComplaintTargetType } from '@prisma/client';

export const createComplaintSchema = z.object({
  targetType: z.nativeEnum(ComplaintTargetType),
  targetId: z.string().uuid('Invalid target identifier').optional().or(z.literal('')),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000),
});

export const updateComplaintSchema = z.object({
  status: z.nativeEnum(ComplaintStatus).optional(),
  assignedTo: z.string().optional(),
  adminNotes: z.string().max(2000).optional(),
  resolution: z.string().max(3000).optional(),
});
