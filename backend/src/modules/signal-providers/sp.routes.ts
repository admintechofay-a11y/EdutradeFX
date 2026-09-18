import { Router } from 'express';
import multer from 'multer';
import { signalProviderController } from './sp.controller';
import { authenticate, optionalAuth } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { generalLimiter, uploadLimiter } from '../../middleware/rateLimit.middleware';
import { uploadImage, uploadDocument, imageStorage } from '../../middleware/upload.middleware';
import {
  registerSPSchema,
  updateSPSchema,
  signalSchema,
  updateSignalSchema,
  spReviewSchema,
  spEnquirySchema,
} from './sp.schemas';

const router = Router();

const spRegistrationUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).fields([
  { name: 'photo', maxCount: 1 },
  { name: 'docs', maxCount: 5 },
]);

// ── PUBLIC ─────────────────────────────────────────
router.get('/', generalLimiter, signalProviderController.getSignalProviders);
router.get('/my/profile', authenticate, authorize('SIGNAL_PROVIDER'), signalProviderController.getMySPProfile);
router.get('/my/signals', authenticate, authorize('SIGNAL_PROVIDER'), signalProviderController.getMySignals);
router.get('/:slug', generalLimiter, optionalAuth, signalProviderController.getSignalProviderBySlug);
router.get('/:id/reviews', generalLimiter, signalProviderController.getReviews);
router.get('/:id/signals', generalLimiter, signalProviderController.getSignals);
router.post('/:id/enquiry', generalLimiter, optionalAuth, validate(spEnquirySchema), signalProviderController.sendEnquiry);

// ── AUTHENTICATED USER ─────────────────────────────
router.post('/:id/reviews', authenticate, validate(spReviewSchema), signalProviderController.addReview);

// ── SIGNAL PROVIDER DASHBOARD & SIGNALS ────────────
router.post(
  '/register',
  authenticate,
  authorize('SIGNAL_PROVIDER'),
  uploadLimiter,
  spRegistrationUpload,
  validate(registerSPSchema),
  signalProviderController.registerSignalProvider
);

router.put(
  '/my/profile',
  authenticate,
  authorize('SIGNAL_PROVIDER'),
  uploadLimiter,
  uploadImage.single('photo'),
  validate(updateSPSchema),
  signalProviderController.updateSignalProvider
);

router.post(
  '/my/signals',
  authenticate,
  authorize('SIGNAL_PROVIDER'),
  validate(signalSchema),
  signalProviderController.createSignal
);

router.put(
  '/my/signals/:id',
  authenticate,
  authorize('SIGNAL_PROVIDER'),
  validate(updateSignalSchema),
  signalProviderController.updateSignal
);

router.delete(
  '/my/signals/:id',
  authenticate,
  authorize('SIGNAL_PROVIDER'),
  signalProviderController.deleteSignal
);

router.post(
  '/my/documents',
  authenticate,
  authorize('SIGNAL_PROVIDER'),
  uploadLimiter,
  uploadDocument.array('docs', 5),
  signalProviderController.uploadDocuments
);

export default router;
