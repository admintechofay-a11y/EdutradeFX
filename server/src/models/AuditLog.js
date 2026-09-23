const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: [true, 'Action type is required'],
      enum: {
        values: ['approve', 'reject', 'suspend', 'activate', 'edit', 'delete', 'payout_processed'],
        message: '{VALUE} is not a valid audit action',
      },
      index: true,
    },
    module: {
      type: String,
      required: [true, 'Target module is required'],
      enum: {
        values: ['broker', 'signal_provider', 'course', 'user', 'review', 'complaint', 'payout', 'settings'],
        message: '{VALUE} is not a valid module name',
      },
      index: true,
    },
    targetId: {
      type: String,
      required: true,
      index: true,
    },
    targetName: {
      type: String,
      required: true,
      trim: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    adminName: {
      type: String,
      default: 'Administrator',
    },
    adminEmail: {
      type: String,
      default: '',
    },
    details: {
      type: String,
      default: '',
    },
    ip: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
