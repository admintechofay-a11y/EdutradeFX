const express = require('express');
const router = express.Router();
const {
  getAllCourses,
  getCourseBySlug,
  getLessonById,
  enrollCourse,
  completeLesson,
  submitQuiz,
  createCourse,
} = require('../controllers/lms.controller');
const { protect, optionalAuth, authorize } = require('../middleware/auth.middleware');

router.get('/courses', getAllCourses);
router.get('/courses/:slug', getCourseBySlug);
router.get('/lessons/:id', getLessonById);

router.post('/courses/:id/enroll', protect, enrollCourse);
router.post('/lessons/:id/complete', protect, completeLesson);
router.post('/quizzes/:id/submit', optionalAuth, submitQuiz);

// Admin routes
router.post('/courses', protect, authorize('admin'), createCourse);

module.exports = router;
