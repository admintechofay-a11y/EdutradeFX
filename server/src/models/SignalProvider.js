const mongoose = require('mongoose');

const signalProviderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Signal provider name is required'],
      trim: true,
      index: true,
    },
    profileImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    },
    strategy: {
      type: String,
      required: [true, 'Trading strategy description is required'],
      trim: true,
    },
    markets: [
      {
        type: String,
        trim: true,
      },
    ],
    subscriptionPrice: {
      type: Number,
      required: [true, 'Subscription price is required (0 for free)'],
      default: 0,
      min: 0,
    },
    historicalPerformance: {
      winRate: { type: Number, default: 75.0 },
      monthlyRoi: { type: Number, default: 15.0 },
      maxDrawdown: { type: Number, default: 7.5 },
      totalSignals: { type: Number, default: 350 },
      avgPipsPerMonth: { type: Number, default: 850 },
      verifiedMyfxbookUrl: { type: String, default: '' },
    },
    riskInfo: {
      type: String,
      required: [true, 'Risk parameters and stop loss guidelines are required'],
      default: '1:2 minimum Risk-Reward ratio on all signals with strict predefined Stop Loss and Take Profit.',
    },
    description: {
      type: String,
      required: [true, 'Signal provider description is required'],
    },
    website: {
      type: String,
      default: '',
      trim: true,
    },
    contactEmail: {
      type: String,
      required: [true, 'Contact email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    disclaimer: {
      type: String,
      default: 'Forex signals are provided for informational and educational purposes. Execution risk is assumed entirely by the subscriber.',
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'pending'],
        message: '{VALUE} is not a valid status',
      },
      default: 'active',
      index: true,
    },
    approvalStatus: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected', 'suspended'],
        message: '{VALUE} is not a valid approval status',
      },
      default: 'pending',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookup and sorting
signalProviderSchema.index({ createdAt: -1 });
signalProviderSchema.index({ status: 1, isFeatured: -1, createdAt: -1 });

// Cascade delete: when a SignalProvider is deleted, remove all associated Reviews
signalProviderSchema.pre('findOneAndDelete', async function (next) {
  const doc = await this.model.findOne(this.getQuery());
  if (doc) {
    await mongoose.model('Review').deleteMany({ targetType: 'signalProvider', targetId: doc._id });
  }
  next();
});

module.exports = mongoose.model('SignalProvider', signalProviderSchema);

