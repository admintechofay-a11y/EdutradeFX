import { z } from 'zod';
import { ContactEnquiryStatus } from '@prisma/client';

export const createContactEnquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional().or(z.literal('')),
  category: z.string().min(1, 'Please select an enquiry category'),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
});

export const updateContactEnquirySchema = z.object({
  status: z.nativeEnum(ContactEnquiryStatus).optional(),
  adminNotes: z.string().max(3000).optional(),
});
