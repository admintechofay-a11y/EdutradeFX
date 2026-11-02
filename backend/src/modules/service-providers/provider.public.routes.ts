import { Router } from 'express';
import { z } from 'zod';
import { providerPublicController } from './provider.public.controller';
import { authenticate, optionalAuth } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { generalLimiter, reviewLimiter } from '../../middleware/rateLimit.middleware';

const router = Router();

const enquirySchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(100),
  email: z.string().trim().email('Valid email is required'),
  phone: z.string().trim().max(50).optional().nullable(),
  companyName: z.string().trim().max(150).optional().nullable(),
  roleTitle: z.string().trim().max(100).optional().nullable(),
  country: z.string().trim().max(100).optional().nullable(),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(5000),
  budgetRange: z.string().trim().max(100).optional().nullable(),
  timeline: z.string().trim().max(100).optional().nullable(),
  productId: z.string().uuid().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  type: z.enum(['GENERAL', 'QUOTE_REQUEST', 'DEMO_REQUEST', 'INTEGRATION_QUERY', 'PARTNERSHIP']).default('GENERAL'),
});

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().max(150).optional().nullable(),
  comment: z.string().trim().min(10, 'Review comment must be at least 10 characters').max(3000),
  productId: z.string().uuid().optional().nullable(),
});

// ── DIRECTORY & DISCOVERY ─────────────────────────────────────────────────
router.get('/', generalLimiter, providerPublicController.getDirectory);
router.get('/categories', generalLimiter, providerPublicController.getCategories);
router.get('/:slug', generalLimiter, providerPublicController.getProviderBySlug);
router.get('/:providerSlug/products/:productSlug', generalLimiter, providerPublicController.getProductBySlug);

// ── FORM 9 LIVE PREVIEW ───────────────────────────────────────────────────
router.get('/:slug/preview', authenticate, providerPublicController.getProviderPreview);

// ── B2B ENQUIRY & REVIEWS ─────────────────────────────────────────────────
router.post('/:id/enquiries', generalLimiter, optionalAuth, validate(enquirySchema), providerPublicController.submitEnquiry);
router.post('/:id/reviews', authenticate, reviewLimiter, validate(reviewSchema), providerPublicController.submitReview);

export default router;

