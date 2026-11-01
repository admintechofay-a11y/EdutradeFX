import { Router } from 'express';
import { Role } from '@prisma/client';
import { providerController } from './provider.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  uploadLimiter,
  generalLimiter,
} from '../../middleware/rateLimit.middleware';
import {
  uploadProviderImageMemory,
  uploadProviderDocumentMemory,
} from '../../middleware/upload.middleware';
import {
  updateProviderProfileSchema,
  selectCategoriesSchema,
  saveCategoryDraftSchema,
  submitCategorySchema,
} from './provider.schemas';

const router = Router();

// All provider portal routes require authenticated SERVICE_PROVIDER
router.use(authenticate, authorize(Role.SERVICE_PROVIDER));

// ── COMPANY PROFILE (Form 2 & Form 6) ─────────────────────────────────────
router.get('/my/profile', generalLimiter, providerController.getMyProfile);
router.put(
  '/my/profile',
  generalLimiter,
  validate(updateProviderProfileSchema),
  providerController.updateMyProfile
);

// Media uploads
router.post(
  '/my/profile/logo',
  uploadLimiter,
  uploadProviderImageMemory.single('logo'),
  providerController.uploadLogo
);
router.post(
  '/my/profile/cover',
  uploadLimiter,
  uploadProviderImageMemory.single('cover'),
  providerController.uploadCover
);
router.post(
  '/my/profile/presentation',
  uploadLimiter,
  uploadProviderDocumentMemory.single('presentation'),
  providerController.uploadPresentation
);

// ── CATEGORIES ────────────────────────────────────────────────────────────
router.get('/my/categories', generalLimiter, providerController.getMyCategories);
router.put(
  '/my/categories',
  generalLimiter,
  validate(selectCategoriesSchema),
  providerController.selectCategories
);

router.get('/my/categories/:number/form', generalLimiter, providerController.getCategoryForm);
router.put(
  '/my/categories/:number/draft',
  generalLimiter,
  validate(saveCategoryDraftSchema),
  providerController.saveCategoryDraft
);
router.post(
  '/my/categories/:number/submit',
  generalLimiter,
  validate(submitCategorySchema),
  providerController.submitCategory
);

export default router;
