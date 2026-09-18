import { z } from 'zod';
import { LessonType } from '@prisma/client';

export const COURSE_CATEGORIES = [
  'Forex Basics',
  'Technical Analysis',
  'Fundamental Analysis',
  'Risk Management',
  'Trading Psychology',
  'Algorithmic Trading',
  'Price Action',
  'Advanced Strategies',
] as const;

export const COURSE_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'] as const;

export const registerTutorSchema = z.object({
  bio: z.string().min(20, 'Bio must be at least 20 characters').max(2000),
  expertise: z.array(z.string()).min(1, 'Please select at least one area of expertise').or(
    z.string().transform((s) => s.split(',').map((x) => x.trim()).filter(Boolean))
  ),
  yearsExperience: z.coerce.number().int().min(0).max(50).optional(),
  bankDetails: z
    .object({
      accountHolder: z.string().optional(),
      accountNumber: z.string().optional(),
      ifscCode: z.string().optional(),
      bankName: z.string().optional(),
      upiId: z.string().optional(),
    })
    .optional(),
});

export const updateTutorSchema = registerTutorSchema.partial();

export const courseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  shortDescription: z.string().min(10, 'Short description must be at least 10 characters').max(300),
  description: z.string().min(20, 'Description must be at least 20 characters').max(10000),
  category: z.enum(COURSE_CATEGORIES),
  level: z.enum(COURSE_LEVELS),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  discountPrice: z.coerce.number().min(0).optional(),
  discountUntil: z.coerce.date().optional(),
  currency: z.string().default('INR'),
  prerequisites: z.array(z.string()).optional().or(
    z.string().transform((s) => s.split(',').map((x) => x.trim()).filter(Boolean))
  ),
  learningOutcomes: z.array(z.string()).min(3, 'Provide at least 3 key learning outcomes').or(
    z.string().transform((s) => s.split(',').map((x) => x.trim()).filter(Boolean))
  ),
  language: z.string().default('English'),
  seoTitle: z.string().max(100).optional(),
  seoDescription: z.string().max(250).optional(),
});

export const updateCourseSchema = courseSchema.partial();

export const courseSectionSchema = z.object({
  title: z.string().min(2, 'Section title must be at least 2 characters').max(100),
  order: z.coerce.number().int().min(1).default(1),
});

export const lessonSchema = z.object({
  title: z.string().min(2, 'Lesson title must be at least 2 characters').max(200),
  type: z.nativeEnum(LessonType).default(LessonType.VIDEO),
  description: z.string().max(3000).optional(),
  duration: z.coerce.number().int().min(0).optional(), // duration in minutes or seconds
  order: z.coerce.number().int().min(1).default(1),
  isFree: z.preprocess((val) => val === 'true' || val === true, z.boolean().default(false)),
  contentUrl: z.string().optional(),
});

export const updateLessonSchema = lessonSchema.partial();

export const enrollSchema = z.object({
  courseId: z.string().uuid('Invalid Course ID format'),
});

export const verifyPaymentSchema = z.object({
  courseId: z.string().uuid('Invalid Course ID format'),
  razorpayOrderId: z.string().min(1, 'Order ID is required'),
  razorpayPaymentId: z.string().min(1, 'Payment ID is required'),
  razorpaySignature: z.string().min(1, 'Signature is required'),
});

export const courseReviewSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(20, 'Comment must be at least 20 characters').max(2000),
});

export const payoutRequestSchema = z.object({
  amount: z.coerce.number().positive('Payout amount must be positive'),
  notes: z.string().max(500).optional(),
});
