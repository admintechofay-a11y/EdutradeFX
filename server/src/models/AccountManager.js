const mongoose = require('mongoose');

const accountManagerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Account manager name is required'],
      trim: true,
      index: true,
    },
    company: {
      type: String,
      required: [true, 'Company or firm name is required'],
      trim: true,
    },
    profileImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    },
    experience: {
      type: String,
      required: [true, 'Years of experience is required'],
      default: '5+ years',
    },
    strategy: {
      type: String,
      required: [true, 'Trading strategy description is required'],
      trim: true,
    },
    minInvestment: {
      type: Number,
      required: [true, 'Minimum investment is required'],
      default: 1000,
    },
    historicalPerformance: {
      monthlyReturn: { type: Number, default: 12.5 },
      maxDrawdown: { type: Number, default: 8.5 },
      winRate: { type: Number, default: 72.0 },
      totalPips: { type: Number, default: 4500 },
      trackRecordUrl: { type: String, default: '' },
    },
    riskInfo: {
      type: String,
      required: [true, 'Risk management parameters and info are required'],
      default: 'Maximum 1.5% risk per trade with hard stop loss on all open positions.',
    },
    tradingStyle: {
      type: String,
      enum: ['Scalping', 'Day Trading', 'Swing Trading', 'Algorithmic', 'Price Action', 'Macro'],
      default: 'Day Trading',
    },
    description: {
      type: String,
      required: [true, 'Detailed manager bio/description is required'],
    },
    contactEmail: {
      type: String,
      required: [true, 'Contact email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid contact email'],
    },
    website: {
      type: String,
      default: '',
      trim: true,
    },
    disclaimer: {
      type: String,
      default: 'Past performance is not indicative of future returns. Managed accounts carry high capital risk.',
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
accountManagerSchema.index({ createdAt: -1 });
accountManagerSchema.index({ status: 1, isFeatured: -1, createdAt: -1 });

// Cascade delete: when an AccountManager is deleted, remove all associated Reviews
accountManagerSchema.pre('findOneAndDelete', async function (next) {
  const doc = await this.model.findOne(this.getQuery());
  if (doc) {
    await mongoose.model('Review').deleteMany({ targetType: 'accountManager', targetId: doc._id });
  }
  next();
});

module.exports = mongoose.model('AccountManager', accountManagerSchema);

