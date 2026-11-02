import { Router } from 'express';
import { z } from 'zod';
import { Role, ProviderStatus, ProviderCategoryStatus, ProductStatus, ModerationStatus } from '@prisma/client';
import { providerAdminController } from './provider.admin.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';

const router = Router();

router.use(authenticate, authorize(Role.ADMIN));

const updateStatusSchema = z.object({
  status: z.nativeEnum(ProviderStatus),
  note: z.string().trim().optional(),
});

const updateCategoryStatusSchema = z.object({
  status: z.nativeEnum(ProviderCategoryStatus),
  note: z.string().trim().optional(),
});

const updateProductStatusSchema = z.object({
  status: z.nativeEnum(ProductStatus),
  note: z.string().trim().optional(),
});

const claimVerificationSchema = z.object({
  targetType: z.enum(['CATEGORY', 'PRODUCT']),
  claimKey: z.string().trim().min(1),
  verified: z.boolean(),
});

const verifiedBadgeSchema = z.object({
  verified: z.boolean(),
  note: z.string().trim().optional(),
});

const moderateReviewSchema = z.object({
  status: z.nativeEnum(ModerationStatus),
  note: z.string().trim().optional(),
});

// ── PROVIDER REVIEW & DOSSIER ─────────────────────────────────────────────
router.get('/', providerAdminController.listProviders);
router.get('/:id', providerAdminController.getProviderDetails);
router.patch('/:id/status', validate(updateStatusSchema), providerAdminController.updateStatus);
router.patch('/:id/verified-badge', validate(verifiedBadgeSchema), providerAdminController.toggleVerifiedBadge);

// ── GRANULAR APPROVALS ────────────────────────────────────────────────────
router.patch('/categories/:selectionId/status', validate(updateCategoryStatusSchema), providerAdminController.updateCategoryStatus);
router.patch('/products/:productId/status', validate(updateProductStatusSchema), providerAdminController.updateProductStatus);
router.patch('/claims/:targetId', validate(claimVerificationSchema), providerAdminController.toggleClaimVerification);

// ── REVIEWS MODERATION ────────────────────────────────────────────────────
router.patch('/reviews/:reviewId', validate(moderateReviewSchema), providerAdminController.moderateReview);

export default router;

