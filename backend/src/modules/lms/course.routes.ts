import { Router } from 'express';
import multer from 'multer';
import { lmsController } from './lms.controller';
import { authenticate, optionalAuth } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { generalLimiter, uploadLimiter, paymentLimiter, reviewLimiter } from '../../middleware/rateLimit.middleware';
import { imageStorage } from '../../middleware/upload.middleware';
import {
  courseSchema,
  updateCourseSchema,
  courseSectionSchema,
  courseReviewSchema,
  verifyPaymentSchema,
} from './lms.schemas';

const router = Router();

const courseMediaUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
}).fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'promoVideo', maxCount: 1 },
]);

// ── 1. LITERAL / SPECIFIC PATHS FIRST (prevent shadow by /:slug) ──────────────

// Tutor's own courses
router.get('/my/courses', authenticate, authorize('TUTOR', 'ADMIN'), lmsController.getMyCourses);

// Student's own enrollments
router.get('/enrollments/my', authenticate, lmsController.getMyEnrollments);
router.get('/my/enrollments', authenticate, lmsController.getMyEnrollments);

// Student's wishlist
router.get('/my/wishlist', authenticate, lmsController.getWishlist);

// Public Catalog Listing
router.get('/', generalLimiter, lmsController.getCourses);

// Create Course (Tutor or Admin)
router.post(
  '/',
  authenticate,
  authorize('TUTOR', 'ADMIN'),
  uploadLimiter,
  courseMediaUpload,
  validate(courseSchema),
  lmsController.createCourse
);

// ── 2. ACTIONS ON COURSE BY ID ──────────────────────────────────────────────
router.post('/:id/enroll', authenticate, paymentLimiter, lmsController.initiateEnrollment);
router.post('/:id/order', authenticate, paymentLimiter, lmsController.initiateEnrollment);
router.post('/:id/verify-payment', authenticate, paymentLimiter, validate(verifyPaymentSchema), lmsController.verifyPaymentAndEnroll);
router.post('/:id/submit', authenticate, authorize('TUTOR', 'ADMIN'), lmsController.submitCourseForReview);
router.post('/:id/sections', authenticate, authorize('TUTOR', 'ADMIN'), validate(courseSectionSchema), lmsController.createSection);
router.get('/:id/reviews', generalLimiter, lmsController.getCourseReviews);
router.post('/:id/reviews', authenticate, reviewLimiter, validate(courseReviewSchema), lmsController.addCourseReview);
router.post('/:id/wishlist', authenticate, lmsController.toggleWishlist);
router.post('/:courseId/lessons/:lessonId/complete', authenticate, lmsController.completeLesson);

// Course editing & deletion
router.put(
  '/:id',
  authenticate,
  authorize('TUTOR', 'ADMIN'),
  uploadLimiter,
  courseMediaUpload,
  validate(updateCourseSchema),
  lmsController.updateCourse
);
router.delete('/:id', authenticate, authorize('TUTOR', 'ADMIN'), lmsController.deleteCourse);

// ── 3. PARAMETRIC SLUG (AT BOTTOM SO LITERALS ARE NOT SHADOWED) ─────────────
router.get('/:slug', generalLimiter, optionalAuth, lmsController.getCourseBySlug);

export default router;
