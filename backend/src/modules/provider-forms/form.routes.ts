import { Router } from 'express';
import { Role } from '@prisma/client';
import { formController } from './form.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createCategorySchema,
  updateCategorySchema,
  createSubcategorySchema,
  updateSubcategorySchema,
  createSectionSchema,
  updateSectionSchema,
  createFieldSchema,
  updateFieldSchema,
  createOptionListSchema,
  updateOptionListSchema,
  reorderItemsSchema,
} from './form.schemas';

const router = Router();

// ── PUBLIC / PARTNER QUERIES ──────────────────────────────────────────────
router.get('/categories', formController.getCategories);
router.get('/option-lists', formController.getOptionLists);
router.get('/categories/:number', formController.getCategoryByNumber);

// ── ADMIN FORM BUILDER CRUD ───────────────────────────────────────────────
// Categories
router.post(
  '/admin/categories',
  authenticate,
  authorize(Role.ADMIN),
  validate(createCategorySchema),
  formController.createCategory
);
router.put(
  '/admin/categories/:id',
  authenticate,
  authorize(Role.ADMIN),
  validate(updateCategorySchema),
  formController.updateCategory
);
router.delete(
  '/admin/categories/:id',
  authenticate,
  authorize(Role.ADMIN),
  formController.deleteCategory
);

// Subcategories
router.post(
  '/admin/subcategories',
  authenticate,
  authorize(Role.ADMIN),
  validate(createSubcategorySchema),
  formController.createSubcategory
);
router.put(
  '/admin/subcategories/:id',
  authenticate,
  authorize(Role.ADMIN),
  validate(updateSubcategorySchema),
  formController.updateSubcategory
);
router.delete(
  '/admin/subcategories/:id',
  authenticate,
  authorize(Role.ADMIN),
  formController.deleteSubcategory
);

// Sections
router.post(
  '/admin/sections',
  authenticate,
  authorize(Role.ADMIN),
  validate(createSectionSchema),
  formController.createSection
);
router.put(
  '/admin/sections/:id',
  authenticate,
  authorize(Role.ADMIN),
  validate(updateSectionSchema),
  formController.updateSection
);
router.delete(
  '/admin/sections/:id',
  authenticate,
  authorize(Role.ADMIN),
  formController.deleteSection
);

// Fields
router.post(
  '/admin/fields',
  authenticate,
  authorize(Role.ADMIN),
  validate(createFieldSchema),
  formController.createField
);
router.put(
  '/admin/fields/:id',
  authenticate,
  authorize(Role.ADMIN),
  validate(updateFieldSchema),
  formController.updateField
);
router.delete(
  '/admin/fields/:id',
  authenticate,
  authorize(Role.ADMIN),
  formController.deleteField
);

// Option lists
router.post(
  '/admin/option-lists',
  authenticate,
  authorize(Role.ADMIN),
  validate(createOptionListSchema),
  formController.createOptionList
);
router.put(
  '/admin/option-lists/:id',
  authenticate,
  authorize(Role.ADMIN),
  validate(updateOptionListSchema),
  formController.updateOptionList
);
router.delete(
  '/admin/option-lists/:id',
  authenticate,
  authorize(Role.ADMIN),
  formController.deleteOptionList
);

// Reordering
router.post(
  '/admin/reorder/sections',
  authenticate,
  authorize(Role.ADMIN),
  validate(reorderItemsSchema),
  formController.reorderSections
);
router.post(
  '/admin/reorder/fields',
  authenticate,
  authorize(Role.ADMIN),
  validate(reorderItemsSchema),
  formController.reorderFields
);

export default router;
