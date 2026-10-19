import { Router } from 'express';
import { accountManagerController } from './am.controller';
import { authenticate, optionalAuth } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { generalLimiter, uploadLimiter, reviewLimiter } from '../../middleware/rateLimit.middleware';
import {
  uploadAmPhotoMemory,
  uploadAmDocumentMemory,
} from '../../middleware/upload.middleware';
import {
  amReviewSchema,
  amEnquirySchema,
  acceptAgreementsSchema,
  registerAMSchema,
  updateAMSchema,
} from './am.schemas';

const router = Router();

// ── PUBLIC ─────────────────────────────────────────
router.get('/', generalLimiter, accountManagerController.getAccountManagers);
router.get('/agreements', generalLimiter, accountManagerController.getAgreements);
router.get('/:slug', generalLimiter, optionalAuth, accountManagerController.getAccountManagerBySlug);
router.get('/:id/reviews', generalLimiter, accountManagerController.getReviews);
router.post('/:id/enquiry', generalLimiter, optionalAuth, validate(amEnquirySchema), accountManagerController.sendEnquiry);

// ── AUTHENTICATED USER (Reviews) ───────────────────
router.post('/:id/reviews', authenticate, reviewLimiter, validate(amReviewSchema), accountManagerController.addReview);

// ── ACCOUNT MANAGER DASHBOARD & PROFILE ────────────
router.get(
  '/my/profile',
  authenticate,
  authorize('ACCOUNT_MANAGER'),
  accountManagerController.getMyAMProfile
);

router.put(
  '/my/sections/:section',
  authenticate,
  authorize('ACCOUNT_MANAGER'),
  accountManagerController.saveSection
);

router.post(
  '/my/photo',
  authenticate,
  authorize('ACCOUNT_MANAGER'),
  uploadLimiter,
  uploadAmPhotoMemory.single('photo'),
  accountManagerController.uploadPhoto
);

router.post(
  '/my/documents',
  authenticate,
  authorize('ACCOUNT_MANAGER'),
  uploadLimiter,
  uploadAmDocumentMemory.single('file'),
  accountManagerController.uploadDocument
);

router.delete(
  '/my/documents/:id',
  authenticate,
  authorize('ACCOUNT_MANAGER'),
  accountManagerController.deleteDocument
);

router.post(
  '/my/agreements/accept',
  authenticate,
  authorize('ACCOUNT_MANAGER'),
  validate(acceptAgreementsSchema),
  accountManagerController.acceptAgreements
);

router.post(
  '/my/submit',
  authenticate,
  authorize('ACCOUNT_MANAGER'),
  accountManagerController.submitOnboarding
);

router.get(
  '/my/enquiries',
  authenticate,
  authorize('ACCOUNT_MANAGER'),
  accountManagerController.getMyEnquiries
);

router.patch(
  '/my/enquiries/:id/read',
  authenticate,
  authorize('ACCOUNT_MANAGER'),
  accountManagerController.markEnquiryRead
);

// ── DEPRECATED BACKWARD COMPATIBILITY ──────────────
router.post(
  '/register',
  authenticate,
  authorize('ACCOUNT_MANAGER'),
  validate(registerAMSchema),
  accountManagerController.registerAccountManager
);

router.put(
  '/my/profile',
  authenticate,
  authorize('ACCOUNT_MANAGER'),
  validate(updateAMSchema),
  accountManagerController.updateAccountManager
);

export default router;
