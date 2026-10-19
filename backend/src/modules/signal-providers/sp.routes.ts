import { Router } from 'express';
import multer from 'multer';
import { signalProviderController } from './sp.controller';
import { authenticate, optionalAuth } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { generalLimiter, uploadLimiter, reviewLimiter } from '../../middleware/rateLimit.middleware';
import {
  uploadImage,
  imageStorage,
  uploadSpPhotoMemory,
  uploadSpDocumentMemory,
} from '../../middleware/upload.middleware';
import {
  registerSPSchema,
  updateSPSchema,
  signalSchema,
  updateSignalSchema,
  spReviewSchema,
  spEnquirySchema,
  pricingSchema,
  acceptAgreementsSchema,
} from './sp.schemas';

const router = Router();

const spRegistrationUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).fields([
  { name: 'photo', maxCount: 1 },
  { name: 'docs', maxCount: 5 },
]);

// ── 1. PUBLIC DIRECTORY & AGREEMENTS ────────────────────────
router.get('/', generalLimiter, signalProviderController.getSignalProviders);
router.get('/agreements', generalLimiter, signalProviderController.getAgreements);

// ── 2. AUTHENTICATED SP DASHBOARD & ONBOARDING (/my/*) ─────
// Placed before parameterized routes (/:slug) to prevent route collisions
router.get(
  '/my/profile',
  authenticate,
  authorize('SIGNAL_PROVIDER', 'ADMIN'),
  signalProviderController.getMySPProfile
);

router.put(
  '/my/sections/:section',
  authenticate,
  authorize('SIGNAL_PROVIDER', 'ADMIN'),
  signalProviderController.saveSection
);

router.post(
  '/my/photo',
  authenticate,
  authorize('SIGNAL_PROVIDER', 'ADMIN'),
  uploadLimiter,
  uploadSpPhotoMemory.single('photo'),
  signalProviderController.uploadPhoto
);

router.post(
  '/my/documents',
  authenticate,
  authorize('SIGNAL_PROVIDER', 'ADMIN'),
  uploadLimiter,
  uploadSpDocumentMemory.array('docs', 5),
  signalProviderController.uploadDocuments
);

router.delete(
  '/my/documents/:id',
  authenticate,
  authorize('SIGNAL_PROVIDER', 'ADMIN'),
  signalProviderController.deleteDocument
);

router.get(
  '/my/plans',
  authenticate,
  authorize('SIGNAL_PROVIDER', 'ADMIN'),
  signalProviderController.getPlans
);

router.put(
  '/my/plans',
  authenticate,
  authorize('SIGNAL_PROVIDER', 'ADMIN'),
  validate(pricingSchema),
  signalProviderController.savePlans
);

router.post(
  '/my/agreements/accept',
  authenticate,
  authorize('SIGNAL_PROVIDER', 'ADMIN'),
  validate(acceptAgreementsSchema),
  signalProviderController.acceptAgreements
);

router.post(
  '/my/submit',
  authenticate,
  authorize('SIGNAL_PROVIDER', 'ADMIN'),
  signalProviderController.submitOnboarding
);

// ── S2 FIX: ENQUIRIES ENDPOINTS ──────────────────────────────
router.get(
  '/my/enquiries',
  authenticate,
  authorize('SIGNAL_PROVIDER', 'ADMIN'),
  signalProviderController.getMyEnquiries
);

router.patch(
  '/my/enquiries/:id/read',
  authenticate,
  authorize('SIGNAL_PROVIDER', 'ADMIN'),
  signalProviderController.markEnquiryAsRead
);

// ── SP SIGNALS CRUD ─────────────────────────────────────────
router.get(
  '/my/signals',
  authenticate,
  authorize('SIGNAL_PROVIDER', 'ADMIN'),
  signalProviderController.getMySignals
);

router.post(
  '/my/signals',
  authenticate,
  authorize('SIGNAL_PROVIDER', 'ADMIN'),
  validate(signalSchema),
  signalProviderController.createSignal
);

router.put(
  '/my/signals/:id',
  authenticate,
  authorize('SIGNAL_PROVIDER', 'ADMIN'),
  validate(updateSignalSchema),
  signalProviderController.updateSignal
);

router.patch(
  '/my/signals/:id',
  authenticate,
  authorize('SIGNAL_PROVIDER', 'ADMIN'),
  validate(updateSignalSchema),
  signalProviderController.updateSignal
);

router.patch(
  '/my/signals/:id/close',
  authenticate,
  authorize('SIGNAL_PROVIDER', 'ADMIN'),
  signalProviderController.closeSignal
);

router.delete(
  '/my/signals/:id',
  authenticate,
  authorize('SIGNAL_PROVIDER', 'ADMIN'),
  signalProviderController.deleteSignal
);

// ── LEGACY DEPRECATED ENDPOINTS ─────────────────────────────
router.post(
  '/register',
  authenticate,
  authorize('SIGNAL_PROVIDER', 'ADMIN'),
  uploadLimiter,
  spRegistrationUpload,
  validate(registerSPSchema),
  signalProviderController.registerSignalProvider
);

router.put(
  '/my/profile',
  authenticate,
  authorize('SIGNAL_PROVIDER', 'ADMIN'),
  uploadLimiter,
  uploadImage.single('photo'),
  validate(updateSPSchema),
  signalProviderController.updateSignalProvider
);

// ── 3. PARAMETERIZED PUBLIC & USER INTERACTION ROUTES ───────
router.get('/:slug', generalLimiter, optionalAuth, signalProviderController.getSignalProviderBySlug);
router.get('/:id/reviews', generalLimiter, signalProviderController.getReviews);
router.get('/:id/signals', generalLimiter, signalProviderController.getSignals);
router.post('/:id/enquiry', generalLimiter, optionalAuth, validate(spEnquirySchema), signalProviderController.sendEnquiry);
router.post('/:id/reviews', authenticate, reviewLimiter, validate(spReviewSchema), signalProviderController.addReview);

export default router;
