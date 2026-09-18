import { Router } from 'express';
import multer from 'multer';
import { brokerController } from './broker.controller';
import { authenticate, optionalAuth } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate, validateQuery } from '../../middleware/validate.middleware';
import { generalLimiter, uploadLimiter } from '../../middleware/rateLimit.middleware';
import { uploadImage, uploadDocument, imageStorage } from '../../middleware/upload.middleware';
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

// ── PUBLIC ROUTES ──────────────────────────────────
router.get('/', generalLimiter, brokerController.getBrokers);
router.get('/compare', generalLimiter, validateQuery(compareBrokersSchema), brokerController.compareBrokers);
router.get('/my/profile', authenticate, authorize('BROKER'), brokerController.getMyBrokerProfile);
router.get('/my/leads', authenticate, authorize('BROKER'), brokerController.getMyLeads);
router.get('/:slug', generalLimiter, optionalAuth, brokerController.getBrokerBySlug);
router.get('/:id/reviews', generalLimiter, brokerController.getReviews);
router.post('/:id/lead', generalLimiter, validate(brokerLeadSchema), brokerController.submitLead);

// ── PROTECTED (AUTHENTICATED USERS) ───────────────
router.post('/:id/reviews', authenticate, validate(brokerReviewSchema), brokerController.addReview);
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
