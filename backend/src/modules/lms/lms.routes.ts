import { Router } from 'express';
import multer from 'multer';
import { lmsController } from './lms.controller';
import { authenticate, optionalAuth } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { generalLimiter, uploadLimiter, paymentLimiter, reviewLimiter } from '../../middleware/rateLimit.middleware';
import { uploadImage, uploadDocument, uploadCourseContent, imageStorage } from '../../middleware/upload.middleware';
import {
  registerTutorSchema,
  courseSchema,
  updateCourseSchema,
  courseSectionSchema,
  lessonSchema,
  updateLessonSchema,
  courseReviewSchema,
  payoutRequestSchema,
  verifyPaymentSchema,
} from './lms.schemas';

const router = Router();

const tutorRegistrationUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).fields([
  { name: 'photo', maxCount: 1 },
  { name: 'docs', maxCount: 5 },
]);

const courseMediaUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
}).fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'promoVideo', maxCount: 1 },
]);

// ── PUBLIC CATALOG ─────────────────────────────────
router.get('/courses', generalLimiter, lmsController.getCourses);
router.get('/courses/:slug', generalLimiter, optionalAuth, lmsController.getCourseBySlug);
router.get('/courses/:id/reviews', generalLimiter, lmsController.getCourseReviews);

// ── STUDENT ENROLLMENT & LEARNING ──────────────────
router.post('/courses/:id/enroll', authenticate, paymentLimiter, lmsController.initiateEnrollment);
router.post('/payments/verify', authenticate, paymentLimiter, validate(verifyPaymentSchema), lmsController.verifyPaymentAndEnroll);
router.get('/my/enrollments', authenticate, lmsController.getMyEnrollments);
router.get('/learn/:lessonId', authenticate, lmsController.getLessonContent);
router.post('/learn/:lessonId/complete', authenticate, lmsController.completeLesson);
router.post('/courses/:id/reviews', authenticate, reviewLimiter, validate(courseReviewSchema), lmsController.addCourseReview);
router.post('/courses/:id/wishlist', authenticate, lmsController.toggleWishlist);
router.get('/my/wishlist', authenticate, lmsController.getWishlist);

// ── TUTOR / INSTRUCTOR STUDIO ───────────────────────
router.post(
  '/tutor/register',
  authenticate,
  authorize('TUTOR'),
  uploadLimiter,
  tutorRegistrationUpload,
  validate(registerTutorSchema),
  lmsController.registerTutor
);

router.get('/tutor/profile', authenticate, authorize('TUTOR'), lmsController.getMyTutorProfile);
router.get('/tutor/earnings', authenticate, authorize('TUTOR'), lmsController.getTutorEarnings);
router.post('/tutor/payouts', authenticate, authorize('TUTOR'), validate(payoutRequestSchema), lmsController.requestPayout);
router.get('/tutor/payouts', authenticate, authorize('TUTOR'), lmsController.getMyPayouts);
router.post('/tutor/documents', authenticate, authorize('TUTOR'), uploadLimiter, uploadDocument.array('docs', 5), lmsController.uploadDocuments);

// Course Builder
router.post('/courses', authenticate, authorize('TUTOR'), uploadLimiter, courseMediaUpload, validate(courseSchema), lmsController.createCourse);
router.put('/courses/:id', authenticate, authorize('TUTOR'), uploadLimiter, courseMediaUpload, validate(updateCourseSchema), lmsController.updateCourse);
router.delete('/courses/:id', authenticate, authorize('TUTOR'), lmsController.deleteCourse);
router.post('/courses/:id/submit', authenticate, authorize('TUTOR'), lmsController.submitCourseForReview);

// Curriculum Sections & Lessons
router.post('/courses/:id/sections', authenticate, authorize('TUTOR'), validate(courseSectionSchema), lmsController.createSection);
router.put('/sections/:id', authenticate, authorize('TUTOR'), lmsController.updateSection);
router.delete('/sections/:id', authenticate, authorize('TUTOR'), lmsController.deleteSection);

router.post(
  '/sections/:id/lessons',
  authenticate,
  authorize('TUTOR'),
  uploadLimiter,
  uploadCourseContent.single('content'),
  validate(lessonSchema),
  lmsController.createLesson
);

router.put(
  '/lessons/:id',
  authenticate,
  authorize('TUTOR'),
  uploadLimiter,
  uploadCourseContent.single('content'),
  validate(updateLessonSchema),
  lmsController.updateLesson
);

router.delete('/lessons/:id', authenticate, authorize('TUTOR'), lmsController.deleteLesson);

export default router;
