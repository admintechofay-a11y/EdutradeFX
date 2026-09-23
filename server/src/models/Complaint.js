const mongoose = require('mongoose');

const internalNoteSchema = new mongoose.Schema({
  note: {
    type: String,
    required: true,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  authorName: {
    type: String,
    default: 'Compliance Officer',
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const complaintSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Complainant name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
      index: true,
    },
    mobile: {
      type: String,
      trim: true,
      default: '',
    },
    company: {
      type: String,
      required: [true, 'Broker or company name under dispute is required'],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Dispute category is required'],
      enum: [
        'withdrawal_delay',
        'slippage_manipulation',
        'account_freeze',
        'bonus_trap',
        'unauthorized_trades',
        'signal_fraud',
        'other',
      ],
      default: 'withdrawal_delay',
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Detailed description of the dispute is required'],
    },
    documents: [
      {
        type: String, // Cloudinary or secure storage URLs
      },
    ],
    declaration: {
      type: Boolean,
      required: [true, 'Declaration of accuracy is required'],
      default: false,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'reviewing', 'resolved', 'closed'],
        message: '{VALUE} is not a valid complaint status',
      },
      default: 'pending',
      index: true,
    },
    internalNotes: [internalNoteSchema],
  },
  {
    timestamps: true,
  }
);

complaintSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);

