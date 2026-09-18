import { z } from 'zod';
import { BlogStatus } from '@prisma/client';

export const createPostSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  content: z.string().min(20, 'Content must have at least 20 characters'),
  excerpt: z.string().min(10).max(500).optional(),
  category: z.string().min(2, 'Category is required'),
  tags: z.array(z.string()).optional().or(
    z.string().transform((s) => s.split(',').map((x) => x.trim()).filter(Boolean))
  ),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
  status: z.nativeEnum(BlogStatus).default(BlogStatus.DRAFT),
});

export const updatePostSchema = createPostSchema.partial();
