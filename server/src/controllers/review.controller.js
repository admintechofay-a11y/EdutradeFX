const { Review } = require('../models');

// @desc    Create a review for a broker, accountManager, or signalProvider
// @route   POST /api/reviews
// @access  Private (Auth User)
exports.createReview = async (req, res) => {
  try {
    const { targetType, targetId, rating, comment } = req.body;

    if (!targetType || !targetId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide targetType, targetId, rating (1-5), and comment',
      });
    }

    if (!['broker', 'accountManager', 'signalProvider'].includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid targetType. Must be broker, accountManager, or signalProvider',
      });
    }

    const review = await Review.create({
      targetType,
      targetId,
      user: req.user.id,
      rating: Number(rating),
      comment,
      status: 'approved',
    });

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name email role')
      .populate('targetId', 'name logo company profileImage')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: populatedReview,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get reviews for a target with aggregation and pagination
// @route   GET /api/reviews/:targetType/:targetId
// @access  Public
exports.getReviewsByTarget = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!['broker', 'accountManager', 'signalProvider'].includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid targetType. Must be broker, accountManager, or signalProvider',
      });
    }

    const query = {
      targetType,
      targetId,
      status: 'approved',
    };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Review.countDocuments(query);

    // Calculate rating using MongoDB aggregation pipeline
    const { averageRating, totalReviews } = await Review.calculateAverageRating(
      targetType,
      targetId
    );

    const reviews = await Review.find(query)
      .populate('user', 'name role')
      .populate('targetId', 'name logo company profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      averageRating,
      totalReviews,
      data: reviews,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

