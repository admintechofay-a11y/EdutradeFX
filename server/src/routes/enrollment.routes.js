const express = require('express');
const router = express.Router();
const {
  enrollCourse,
  getMyEnrollments,
  updateProgress,
} = require('../controllers/enrollment.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect); // All enrollment routes require user JWT

router.post('/', enrollCourse);
router.get('/me', getMyEnrollments);
router.patch('/:id/progress', updateProgress);

module.exports = router;
