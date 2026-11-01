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
import {
  createProductSchema,
  updateProductSchema,
  productCategoryLinkSchema,
  updateTechnicalSpecSchema,
  updateIntegrationSchema,
  updatePricingSchema,
  createMediaSchema,
  createProductDocSchema,
} from './provider.product.schemas';
import {
  createTeamMemberSchema,
  updateTeamMemberSchema,
  createProviderDocSchema,
  updateProviderDocSchema,
} from './provider.team-docs.schemas';

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

// ── CATEGORIES (Form 2 Selection & Form 8/10) ─────────────────────────────
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

// ── PRODUCTS (Form 3 Master) ──────────────────────────────────────────────
router.get('/my/products', generalLimiter, providerController.getMyProducts);
router.post(
  '/my/products',
  generalLimiter,
  validate(createProductSchema),
  providerController.createProduct
);
router.get('/my/products/:id', generalLimiter, providerController.getProductById);
router.put(
  '/my/products/:id',
  generalLimiter,
  validate(updateProductSchema),
  providerController.updateProduct
);
router.delete('/my/products/:id', generalLimiter, providerController.deleteProduct);
router.post('/my/products/:id/duplicate', generalLimiter, providerController.duplicateProduct);

// Product sub-forms (Forms 4, 5, 7, Cat 10, Media, Docs)
router.put(
  '/my/products/:id/categories',
  generalLimiter,
  validate(productCategoryLinkSchema),
  providerController.linkProductCategory
);
router.put(
  '/my/products/:id/specs',
  generalLimiter,
  validate(updateTechnicalSpecSchema),
  providerController.updateTechnicalSpec
);
router.put(
  '/my/products/:id/integrations',
  generalLimiter,
  validate(updateIntegrationSchema),
  providerController.updateIntegration
);
router.put(
  '/my/products/:id/pricing',
  generalLimiter,
  validate(updatePricingSchema),
  providerController.updatePricing
);

router.post(
  '/my/products/:id/media',
  generalLimiter,
  validate(createMediaSchema),
  providerController.addProductMedia
);
router.delete('/my/products/:id/media/:mediaId', generalLimiter, providerController.deleteProductMedia);

router.post(
  '/my/products/:id/documents',
  generalLimiter,
  validate(createProductDocSchema),
  providerController.addProductDoc
);
router.delete('/my/products/:id/documents/:docId', generalLimiter, providerController.deleteProductDoc);

// ── TEAM MEMBERS ──────────────────────────────────────────────────────────
router.get('/my/team', generalLimiter, providerController.getTeamMembers);
router.post(
  '/my/team',
  generalLimiter,
  validate(createTeamMemberSchema),
  providerController.createTeamMember
);
router.put(
  '/my/team/:id',
  generalLimiter,
  validate(updateTeamMemberSchema),
  providerController.updateTeamMember
);
router.delete('/my/team/:id', generalLimiter, providerController.deleteTeamMember);
router.post(
  '/my/team/:id/photo',
  uploadLimiter,
  uploadProviderImageMemory.single('photo'),
  providerController.uploadTeamPhoto
);

// ── VERIFICATION DOCUMENTS & VAULT ────────────────────────────────────────
router.get('/my/documents', generalLimiter, providerController.getDocuments);
router.post(
  '/my/documents',
  generalLimiter,
  validate(createProviderDocSchema),
  providerController.createDocument
);
router.put(
  '/my/documents/:id',
  generalLimiter,
  validate(updateProviderDocSchema),
  providerController.updateDocument
);
router.delete('/my/documents/:id', generalLimiter, providerController.deleteDocument);
router.post(
  '/my/documents/upload',
  uploadLimiter,
  uploadProviderDocumentMemory.single('file'),
  providerController.uploadDocumentFile
);
router.get('/my/documents/:id/signed-url', generalLimiter, providerController.getSignedDocumentUrl);

export default router;
