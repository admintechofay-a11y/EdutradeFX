const mongoose = require('mongoose');

const signalSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SignalProvider',
      required: [true, 'Signal provider reference is required'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    pair: {
      type: String,
      required: [true, 'Trading currency pair/instrument is required'],
      trim: true,
      uppercase: true,
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: ['BUY', 'SELL'],
        message: '{VALUE} must be either BUY or SELL',
      },
      required: [true, 'Signal action type is required'],
    },
    timeframe: {
      type: String,
      default: 'H1',
      trim: true,
    },
    entryPrice: {
      type: Number,
      required: [true, 'Entry price is required'],
    },
    stopLoss: {
      type: Number,
      required: [true, 'Stop Loss level is required'],
    },
    takeProfit1: {
      type: Number,
      required: [true, 'Take Profit 1 level is required'],
    },
    takeProfit2: {
      type: Number,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'closed', 'cancelled'],
        message: '{VALUE} is not a valid signal status',
      },
      default: 'active',
      index: true,
    },
    result: {
      type: String,
      enum: {
        values: ['pending', 'profit', 'loss', 'breakeven'],
        message: '{VALUE} is not a valid result outcome',
      },
      default: 'pending',
    },
    resultPips: {
      type: Number,
      default: 0,
    },
    closedPrice: {
      type: Number,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    openedAt: {
      type: Date,
      default: Date.now,
    },
    closedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

signalSchema.index({ provider: 1, createdAt: -1 });
signalSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Signal', signalSchema);
