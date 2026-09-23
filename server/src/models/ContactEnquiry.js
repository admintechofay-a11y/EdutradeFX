const mongoose = require('mongoose');

const contactEnquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
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
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [3000, 'Message cannot exceed 3000 characters'],
    },
    targetType: {
      type: String,
      enum: ['platform', 'broker', 'signal_provider', 'tutor'],
      default: 'platform',
      index: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    reply: {
      message: { type: String, default: '' },
      repliedAt: { type: Date },
      repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    status: {
      type: String,
      enum: {
        values: ['new', 'in_progress', 'resolved', 'closed'],
        message: '{VALUE} is not a valid enquiry status',
      },
      default: 'new',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

contactEnquirySchema.index({ createdAt: -1 });

module.exports = mongoose.model('ContactEnquiry', contactEnquirySchema);

