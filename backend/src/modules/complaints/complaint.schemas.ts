import { z } from 'zod';
import { ComplaintStatus, ComplaintTargetType } from '@prisma/client';

export const createComplaintSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional().or(z.literal('')),
  companyName: z.string().optional().or(z.literal('')),
  category: z.string().min(1, 'Please select a complaint category'),
  targetType: z.nativeEnum(ComplaintTargetType),
  targetId: z.string().uuid('Invalid target identifier').optional().or(z.literal('')),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000),
  declarationConsent: z.boolean().refine((val) => val === true, {
    message: 'You must confirm the truthfulness of your declaration and dispute terms.',
  }),
});

export const updateComplaintSchema = z.object({
  status: z.nativeEnum(ComplaintStatus).optional(),
  assignedTo: z.string().optional(),
  adminNotes: z.string().max(2000).optional(),
  resolution: z.string().max(3000).optional(),
});
