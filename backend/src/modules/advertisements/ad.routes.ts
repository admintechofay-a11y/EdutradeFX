import { Router } from 'express';
import { advertisementController } from './ad.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { generalLimiter, uploadLimiter } from '../../middleware/rateLimit.middleware';
import { uploadImage } from '../../middleware/upload.middleware';
import { createAdSchema, updateAdSchema } from './ad.schemas';

const router = Router();

// ── PUBLIC ─────────────────────────────────────────
router.get('/active', generalLimiter, advertisementController.getActiveAds);
router.post('/:id/impression', generalLimiter, advertisementController.trackImpression);
router.post('/:id/click', generalLimiter, advertisementController.trackClick);

// ── ADMIN ──────────────────────────────────────────
router.get('/admin', authenticate, authorize('ADMIN'), advertisementController.getAdsAdmin);

router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  uploadLimiter,
  uploadImage.single('image'),
  validate(createAdSchema),
  advertisementController.createAd
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  uploadLimiter,
  uploadImage.single('image'),
  validate(updateAdSchema),
  advertisementController.updateAd
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  advertisementController.deleteAd
);

export default router;
