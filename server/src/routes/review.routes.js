const express = require('express');
const router = express.Router();
const {
  createReview,
  getReviewsByTarget,
} = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', protect, createReview);
router.get('/:targetType/:targetId', getReviewsByTarget);

module.exports = router;
