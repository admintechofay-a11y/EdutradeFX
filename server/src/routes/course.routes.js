const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourseById,
  getMyCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  submitCourseForApproval,
  togglePublishCourse,
  getMyEarnings,
  getMyPayouts,
  createPayoutRequest,
  getMyCourseReviews,
  replyCourseReview,
  getAdminCourses,
  updateCourseApproval,
} = require('../controllers/course.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public routes
router.get('/', getCourses);

// Tutor Self-Service routes (Tutor or Admin)
router.get('/me/courses', protect, authorize('tutor', 'admin'), getMyCourses);
router.post('/', protect, authorize('tutor', 'admin'), createCourse);
router.get('/me/earnings', protect, authorize('tutor', 'admin'), getMyEarnings);
router.get('/me/payouts', protect, authorize('tutor', 'admin'), getMyPayouts);
router.post('/me/payouts', protect, authorize('tutor', 'admin'), createPayoutRequest);
router.get('/me/reviews', protect, authorize('tutor', 'admin'), getMyCourseReviews);
router.post('/me/reviews/:id/reply', protect, authorize('tutor', 'admin'), replyCourseReview);
router.put('/:id', protect, authorize('tutor', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('tutor', 'admin'), deleteCourse);
router.post('/:id/submit', protect, authorize('tutor', 'admin'), submitCourseForApproval);
router.post('/:id/publish', protect, authorize('tutor', 'admin'), togglePublishCourse);

// Admin-only management routes
router.get('/admin/all', protect, authorize('admin'), getAdminCourses);
router.patch('/admin/:id/approval', protect, authorize('admin'), updateCourseApproval);

// Single course lookup (after /me routes to avoid collision)
router.get('/:id', getCourseById);

module.exports = router;
