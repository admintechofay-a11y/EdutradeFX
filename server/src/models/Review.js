const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      required: [true, 'Target type is required'],
      enum: {
        values: ['broker', 'accountManager', 'signalProvider', 'course'],
        message: '{VALUE} is not a valid target type',
      },
      index: true,
    },
    targetModel: {
      type: String,
      required: [true, 'Target model is required for dynamic ref'],
      enum: ['Broker', 'AccountManager', 'SignalProvider', 'Course'],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Target ID is required'],
      refPath: 'targetModel',
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review author user reference is required'],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      maxlength: [2000, 'Review cannot exceed 2000 characters'],
    },
    reply: {
      comment: { type: String, default: '' },
      repliedAt: { type: Date },
      authorRole: { type: String, default: '' },
      authorName: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

// Pre-validate hook to automatically populate targetModel based on targetType
reviewSchema.pre('validate', function (next) {
  if (this.targetType === 'broker') {
    this.targetModel = 'Broker';
  } else if (this.targetType === 'accountManager') {
    this.targetModel = 'AccountManager';
  } else if (this.targetType === 'signalProvider') {
    this.targetModel = 'SignalProvider';
  } else if (this.targetType === 'course') {
    this.targetModel = 'Course';
  }
  next();
});

// Compound indexes for fast lookups and sorting
reviewSchema.index({ targetType: 1, targetId: 1, status: 1 });
reviewSchema.index({ createdAt: -1 });

// Aggregation pipeline static method to calculate average rating per listing
reviewSchema.statics.calculateAverageRating = async function (targetType, targetId) {
  const objectId = typeof targetId === 'string' ? new mongoose.Types.ObjectId(targetId) : targetId;
  const stats = await this.aggregate([
    {
      $match: {
        targetType,
        targetId: objectId,
        status: 'approved',
      },
    },
    {
      $group: {
        _id: '$targetId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    return {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
    };
  }

  return { averageRating: 0, totalReviews: 0 };
};

module.exports = mongoose.model('Review', reviewSchema);

