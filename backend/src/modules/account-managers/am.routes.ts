import { Router } from 'express';
import multer from 'multer';
import { accountManagerController } from './am.controller';
import { authenticate, optionalAuth } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { generalLimiter, uploadLimiter } from '../../middleware/rateLimit.middleware';
import { uploadImage, uploadDocument, imageStorage } from '../../middleware/upload.middleware';
import {
  registerAMSchema,
  updateAMSchema,
  amReviewSchema,
  amEnquirySchema,
} from './am.schemas';

const router = Router();

const amRegistrationUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).fields([
  { name: 'photo', maxCount: 1 },
  { name: 'docs', maxCount: 5 },
]);

// ── PUBLIC ─────────────────────────────────────────
router.get('/', generalLimiter, accountManagerController.getAccountManagers);
router.get('/my/profile', authenticate, authorize('ACCOUNT_MANAGER'), accountManagerController.getMyAMProfile);
router.get('/my/enquiries', authenticate, authorize('ACCOUNT_MANAGER'), accountManagerController.getMyEnquiries);
router.get('/:slug', generalLimiter, optionalAuth, accountManagerController.getAccountManagerBySlug);
router.get('/:id/reviews', generalLimiter, accountManagerController.getReviews);
router.post('/:id/enquiry', generalLimiter, optionalAuth, validate(amEnquirySchema), accountManagerController.sendEnquiry);

// ── AUTHENTICATED USER ─────────────────────────────
router.post('/:id/reviews', authenticate, validate(amReviewSchema), accountManagerController.addReview);

// ── ACCOUNT MANAGER DASHBOARD & PROFILE ────────────
router.post(
  '/register',
  authenticate,
  authorize('ACCOUNT_MANAGER'),
  uploadLimiter,
  amRegistrationUpload,
  validate(registerAMSchema),
  accountManagerController.registerAccountManager
);

router.put(
  '/my/profile',
  authenticate,
  authorize('ACCOUNT_MANAGER'),
  uploadLimiter,
  uploadImage.single('photo'),
  validate(updateAMSchema),
  accountManagerController.updateAccountManager
);

router.post(
  '/my/documents',
  authenticate,
  authorize('ACCOUNT_MANAGER'),
  uploadLimiter,
  uploadDocument.array('docs', 5),
  accountManagerController.uploadDocuments
);

export default router;
