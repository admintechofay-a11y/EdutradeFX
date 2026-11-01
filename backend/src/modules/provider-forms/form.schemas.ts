import { z } from 'zod';
import { FormFieldType, FieldVisibility, ClaimLevel, FormScope } from '@prisma/client';

export const optionItemSchema = z.object({
  value: z.string().min(1, 'Option value is required'),
  label: z.string().min(1, 'Option label is required'),
  description: z.string().optional().nullable(),
});

export const createOptionListSchema = z.object({
  key: z.string().trim().min(2).max(100).regex(/^[a-z0-9_-]+$/i, 'Key must be alphanumeric with underscores or dashes'),
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().optional().nullable(),
  items: z.array(optionItemSchema).min(1, 'At least one option item is required'),
});

export const updateOptionListSchema = createOptionListSchema.partial();

export const createCategorySchema = z.object({
  number: z.number().int().min(1).max(99),
  name: z.string().trim().min(2).max(150),
  slug: z.string().trim().min(2).max(150),
  shortDescription: z.string().trim().max(500).optional().nullable(),
  fullDescription: z.string().trim().optional().nullable(),
  icon: z.string().trim().max(100).optional().nullable(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  isPrimaryAllowed: z.boolean().default(true),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createSubcategorySchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().trim().min(2).max(150),
  slug: z.string().trim().min(2).max(150),
  description: z.string().trim().optional().nullable(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateSubcategorySchema = createSubcategorySchema.partial();

export const createSectionSchema = z.object({
  categoryId: z.string().uuid(),
  key: z.string().trim().min(1).max(50),
  title: z.string().trim().min(2).max(250),
  description: z.string().trim().optional().nullable(),
  scope: z.nativeEnum(FormScope).default(FormScope.PROVIDER),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateSectionSchema = createSectionSchema.partial();

export const createFieldSchema = z.object({
  sectionId: z.string().uuid(),
  key: z.string().trim().min(1).max(100),
  label: z.string().trim().min(1).max(250),
  helpText: z.string().trim().optional().nullable(),
  type: z.nativeEnum(FormFieldType),
  scope: z.nativeEnum(FormScope).default(FormScope.PROVIDER),
  required: z.boolean().default(false),
  allowOther: z.boolean().default(false),
  options: z.array(optionItemSchema).optional().nullable(),
  optionSource: z.string().trim().optional().nullable(),
  unitOptions: z.array(z.string()).optional().nullable(),
  statuses: z.array(z.string()).optional().nullable(),
  validation: z.record(z.any()).optional().nullable(),
  visibleWhen: z.record(z.any()).optional().nullable(),
  disjointWith: z.string().trim().optional().nullable(),
  repeatableFields: z.array(z.record(z.any())).optional().nullable(),
  visibility: z.nativeEnum(FieldVisibility).default(FieldVisibility.PUBLIC),
  claimLevel: z.nativeEnum(ClaimLevel).default(ClaimLevel.DECLARED),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const updateFieldSchema = createFieldSchema.partial();

export const reorderItemsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      sortOrder: z.number().int(),
    })
  ).min(1),
});
