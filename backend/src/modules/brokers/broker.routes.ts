import { Router } from 'express';
import multer from 'multer';
import { brokerController } from './broker.controller';
import { authenticate, optionalAuth } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate, validateQuery } from '../../middleware/validate.middleware';
import { generalLimiter, uploadLimiter, reviewLimiter } from '../../middleware/rateLimit.middleware';
import {
  uploadImage,
  uploadDocument,
  imageStorage,
  uploadLicensePdf,
  uploadLicenseProof,
  uploadOfficeImages,
  uploadBoardPhoto,
  uploadPolicyPdf,
  uploadStructureDoc,
  uploadPromoVideo,
} from '../../middleware/upload.middleware';
import {
  registerBrokerSchema,
  updateBrokerSchema,
  brokerReviewSchema,
  brokerLeadSchema,
  compareBrokersSchema,
} from './broker.schemas';

const router = Router();

// Configure dual field uploader for registration
const registrationUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).fields([
  { name: 'logo', maxCount: 1 },
  { name: 'documents', maxCount: 5 },
]);

// ── BROKER SPECIFIC ONBOARDING & DASHBOARD (Must precede /:slug) ──
router.get('/my/profile', authenticate, authorize('BROKER'), brokerController.getMyBrokerProfile);
router.get('/my/leads', authenticate, authorize('BROKER'), brokerController.getMyLeads);
router.get('/my/onboarding', authenticate, authorize('BROKER'), brokerController.getMyOnboarding);
router.put('/my/onboarding/:section', authenticate, authorize('BROKER'), brokerController.updateOnboardingSection);
router.patch('/my/onboarding/:section', authenticate, authorize('BROKER'), brokerController.updateOnboardingSection);
router.post('/my/onboarding/submit', authenticate, authorize('BROKER'), brokerController.submitOnboarding);

// Dedicated wizard upload endpoints
router.post('/my/upload/logo', authenticate, authorize('BROKER'), uploadLimiter, uploadImage.single('file'), brokerController.uploadSingleFile);
router.post('/my/upload/license-pdf', authenticate, authorize('BROKER'), uploadLimiter, uploadLicensePdf.single('file'), brokerController.uploadSingleFile);
router.post('/my/upload/license-proof', authenticate, authorize('BROKER'), uploadLimiter, uploadLicenseProof.single('file'), brokerController.uploadSingleFile);
router.post('/my/upload/office-photos', authenticate, authorize('BROKER'), uploadLimiter, uploadOfficeImages.array('files', 10), brokerController.uploadMultipleFiles);
router.post('/my/upload/board-photo', authenticate, authorize('BROKER'), uploadLimiter, uploadBoardPhoto.single('file'), brokerController.uploadSingleFile);
router.post('/my/upload/policy-pdf', authenticate, authorize('BROKER'), uploadLimiter, uploadPolicyPdf.single('file'), brokerController.uploadSingleFile);
router.post('/my/upload/structure-doc', authenticate, authorize('BROKER'), uploadLimiter, uploadStructureDoc.single('file'), brokerController.uploadSingleFile);
router.post('/my/upload/promo-video', authenticate, authorize('BROKER'), uploadLimiter, uploadPromoVideo.single('file'), brokerController.uploadSingleFile);

// ── PUBLIC ROUTES ──────────────────────────────────
router.get('/', generalLimiter, brokerController.getBrokers);
router.get('/compare', generalLimiter, validateQuery(compareBrokersSchema), brokerController.compareBrokers);
router.get('/:slug', generalLimiter, optionalAuth, brokerController.getBrokerBySlug);
router.get('/:id/reviews', generalLimiter, brokerController.getReviews);
router.post('/:id/lead', generalLimiter, validate(brokerLeadSchema), brokerController.submitLead);

// ── PROTECTED (AUTHENTICATED USERS) ───────────────
router.post('/:id/reviews', authenticate, reviewLimiter, validate(brokerReviewSchema), brokerController.addReview);
router.post('/:id/save', authenticate, brokerController.saveBroker);

// ── BROKER SPECIFIC PROFILE & MANAGEMENT ───────────
router.post(
  '/register',
  authenticate,
  authorize('BROKER'),
  uploadLimiter,
  registrationUpload,
  validate(registerBrokerSchema),
  brokerController.registerBroker
);

router.put(
  '/my/profile',
  authenticate,
  authorize('BROKER'),
  uploadLimiter,
  uploadImage.single('logo'),
  validate(updateBrokerSchema),
  brokerController.updateBroker
);

router.post(
  '/my/documents',
  authenticate,
  authorize('BROKER'),
  uploadLimiter,
  uploadDocument.array('documents', 5),
  brokerController.uploadDocuments
);

router.put(
  '/my/reviews/:reviewId/respond',
  authenticate,
  authorize('BROKER'),
  brokerController.respondToReview
);

export default router;
