const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema(
  {
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Tutor reference is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payout amount is required'],
      min: [10, 'Minimum payout request is $10'],
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['bank_transfer', 'crypto_usdt', 'paypal', 'wise'],
        message: '{VALUE} is not an accepted payout method',
      },
      required: [true, 'Payment method is required'],
    },
    accountDetails: {
      type: String,
      required: [true, 'Payout account details (e.g. IBAN, USDT wallet, PayPal email) are required'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected', 'paid'],
        message: '{VALUE} is not a valid payout status',
      },
      default: 'pending',
      index: true,
    },
    adminNote: {
      type: String,
      default: '',
    },
    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

payoutSchema.index({ tutor: 1, createdAt: -1 });

module.exports = mongoose.model('Payout', payoutSchema);
