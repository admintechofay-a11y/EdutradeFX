const mongoose = require('mongoose');

const performancePointSchema = new mongoose.Schema({
  date: { type: String, required: true },
  equity: { type: Number, required: true },
});

const monthlyHistorySchema = new mongoose.Schema({
  month: { type: String, required: true },
  year: { type: Number, required: true },
  returnPercentage: { type: Number, required: true },
  pips: { type: Number, default: 0 },
  trades: { type: Number, default: 0 },
});

const managerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  title: {
    type: String,
    default: 'Senior FX Algorithmic Trader & Strategy Provider',
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  },
  bio: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['account_manager', 'signal_provider', 'both'],
    default: 'signal_provider',
  },
  tradingStyle: {
    type: String,
    enum: ['Scalping', 'Day Trading', 'Swing', 'Algorithmic/EA', 'Price Action'],
    default: 'Day Trading',
  },
  verified: {
    type: Boolean,
    default: true,
  },
  winRate: {
    type: Number,
    required: true,
    default: 70,
  },
  maxDrawdown: {
    type: Number,
    required: true,
    default: 12.5,
  },
  monthlyRoi: {
    type: Number,
    required: true,
    default: 15.0,
  },
  totalPips: {
    type: Number,
    default: 4500,
  },
  avgTradesPerMonth: {
    type: Number,
    default: 35,
  },
  riskScore: {
    type: Number,
    min: 1,
    max: 10,
    default: 4,
  },
  pricingModel: {
    type: String,
    enum: ['profit_share', 'monthly_subscription', 'free'],
    default: 'monthly_subscription',
  },
  profitSharePercentage: {
    type: Number,
    default: 20,
  },
  subscriptionPrice: {
    type: Number,
    default: 49,
  },
  telegramLink: {
    type: String,
    default: 'https://t.me/edutradefx_signals',
  },
  contactEmail: {
    type: String,
    default: 'signals@edutradefx.com',
  },
  equityCurve: [performancePointSchema],
  monthlyHistory: [monthlyHistorySchema],
  featured: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['active', 'pending_approval', 'suspended'],
    default: 'active',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Manager', managerSchema);
