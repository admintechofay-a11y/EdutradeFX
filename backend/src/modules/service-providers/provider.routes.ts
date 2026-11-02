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

// ── OVERVIEW & SUMMARY ────────────────────────────────────────────────────
router.get(['/my', '/me', '/my/summary', '/me/summary'], generalLimiter, providerController.getMySummary);

// ── COMPANY PROFILE (Form 2 & Form 6) ─────────────────────────────────────
router.get(['/my/profile', '/me/profile'], generalLimiter, providerController.getMyProfile);
router.put(
  ['/my/profile', '/me/profile'],
  generalLimiter,
  validate(updateProviderProfileSchema),
  providerController.updateMyProfile
);
router.put(
  ['/my/commercial', '/me/commercial'],
  generalLimiter,
  providerController.updateMyProfile
);

router.post(
  ['/my/profile/logo', '/me/profile/logo', '/my/media/logo', '/me/media/logo'],
  uploadLimiter,
  uploadProviderImageMemory.single('logo'),
  providerController.uploadLogo
);
router.post(
  ['/my/profile/cover', '/me/profile/cover', '/my/media/cover', '/me/media/cover'],
  uploadLimiter,
  uploadProviderImageMemory.single('cover'),
  providerController.uploadCover
);
router.post(
  ['/my/profile/presentation', '/me/profile/presentation', '/my/media/presentation', '/me/media/presentation'],
  uploadLimiter,
  uploadProviderDocumentMemory.single('presentation'),
  providerController.uploadPresentation
);

// ── CATEGORIES (Form 2 Selection & Form 8/10) ─────────────────────────────
router.get(['/my/categories', '/me/categories'], generalLimiter, providerController.getMyCategories);
router.put(
  ['/my/categories', '/me/categories'],
  generalLimiter,
  validate(selectCategoriesSchema),
  providerController.selectCategories
);

router.get(['/my/categories/:number/form', '/me/categories/:number/form'], generalLimiter, providerController.getCategoryForm);
router.put(
  ['/my/categories/:number/draft', '/me/categories/:number/draft', '/my/categories/:number', '/me/categories/:number'],
  generalLimiter,
  validate(saveCategoryDraftSchema),
  providerController.saveCategoryDraft
);
router.post(
  ['/my/categories/:number/submit', '/me/categories/:number/submit'],
  generalLimiter,
  validate(submitCategorySchema),
  providerController.submitCategory
);

// ── PRODUCTS (Form 3 Master) ──────────────────────────────────────────────
router.get(['/my/products', '/me/products'], generalLimiter, providerController.getMyProducts);
router.post(
  ['/my/products', '/me/products'],
  generalLimiter,
  validate(createProductSchema),
  providerController.createProduct
);
router.get(['/my/products/:id', '/me/products/:id'], generalLimiter, providerController.getProductById);
router.put(
  ['/my/products/:id', '/me/products/:id'],
  generalLimiter,
  validate(updateProductSchema),
  providerController.updateProduct
);
router.delete(['/my/products/:id', '/me/products/:id'], generalLimiter, providerController.deleteProduct);
router.post(['/my/products/:id/duplicate', '/me/products/:id/duplicate'], generalLimiter, providerController.duplicateProduct);

// Product sub-forms (Forms 4, 5, 7, Cat 10, Media, Docs)
router.put(
  ['/my/products/:id/categories', '/me/products/:id/categories'],
  generalLimiter,
  validate(productCategoryLinkSchema),
  providerController.linkProductCategory
);
router.put(
  ['/my/products/:id/specs', '/me/products/:id/specs'],
  generalLimiter,
  validate(updateTechnicalSpecSchema),
  providerController.updateTechnicalSpec
);
router.put(
  ['/my/products/:id/integrations', '/me/products/:id/integrations'],
  generalLimiter,
  validate(updateIntegrationSchema),
  providerController.updateIntegration
);
router.put(
  ['/my/products/:id/pricing', '/me/products/:id/pricing'],
  generalLimiter,
  validate(updatePricingSchema),
  providerController.updatePricing
);

router.post(
  ['/my/products/:id/media', '/me/products/:id/media'],
  generalLimiter,
  validate(createMediaSchema),
  providerController.addProductMedia
);
router.delete(['/my/products/:id/media/:mediaId', '/me/products/:id/media/:mediaId'], generalLimiter, providerController.deleteProductMedia);

router.post(
  ['/my/products/:id/documents', '/me/products/:id/documents'],
  generalLimiter,
  validate(createProductDocSchema),
  providerController.addProductDoc
);
router.delete(['/my/products/:id/documents/:docId', '/me/products/:id/documents/:docId'], generalLimiter, providerController.deleteProductDoc);

// ── TEAM MEMBERS ──────────────────────────────────────────────────────────
router.get(['/my/team', '/me/team'], generalLimiter, providerController.getTeamMembers);
router.post(
  ['/my/team', '/me/team'],
  generalLimiter,
  validate(createTeamMemberSchema),
  providerController.createTeamMember
);
router.put(
  ['/my/team/:id', '/me/team/:id'],
  generalLimiter,
  validate(updateTeamMemberSchema),
  providerController.updateTeamMember
);
router.delete(['/my/team/:id', '/me/team/:id'], generalLimiter, providerController.deleteTeamMember);
router.post(
  ['/my/team/:id/photo', '/me/team/:id/photo'],
  uploadLimiter,
  uploadProviderImageMemory.single('photo'),
  providerController.uploadTeamPhoto
);

// ── VERIFICATION DOCUMENTS & VAULT ────────────────────────────────────────
router.get(['/my/documents', '/me/documents'], generalLimiter, providerController.getDocuments);
router.post(
  ['/my/documents', '/me/documents'],
  generalLimiter,
  validate(createProviderDocSchema),
  providerController.createDocument
);
router.put(
  ['/my/documents/:id', '/me/documents/:id'],
  generalLimiter,
  validate(updateProviderDocSchema),
  providerController.updateDocument
);
router.delete(['/my/documents/:id', '/me/documents/:id'], generalLimiter, providerController.deleteDocument);
router.post(
  ['/my/documents/upload', '/me/documents/upload'],
  uploadLimiter,
  uploadProviderDocumentMemory.single('file'),
  providerController.uploadDocumentFile
);
router.get(['/my/documents/:id/signed-url', '/me/documents/:id/signed-url'], generalLimiter, providerController.getSignedDocumentUrl);

// ── INBOUND B2B ENQUIRIES ─────────────────────────────────────────────────
router.get(['/my/enquiries', '/me/enquiries'], generalLimiter, providerController.getEnquiries);
router.patch(['/my/enquiries/:id', '/me/enquiries/:id'], generalLimiter, providerController.updateEnquiryStatus);

// ── REVIEWS & RATINGS ─────────────────────────────────────────────────────
router.get(['/my/reviews', '/me/reviews'], generalLimiter, providerController.getReviews);

// ── LEGAL AGREEMENTS & SUBMISSION (Form 8) ────────────────────────────────
router.get(['/agreements', '/my/agreements', '/me/agreements'], generalLimiter, providerController.getAgreements);
router.post(['/my/submit', '/me/submit'], generalLimiter, providerController.submitProvider);

export default router;
