const mongoose = require('mongoose');

const accountTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  minDeposit: {
    type: Number,
    default: 0,
  },
  leverage: {
    type: String,
    default: '1:500',
  },
  spread: {
    type: String,
    default: 'From 0.0 pips',
  },
  commission: {
    type: String,
    default: 'Zero Commission',
  },
});

const brokerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Broker name is required'],
      unique: true,
      trim: true,
      index: true,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
      required: [true, 'Broker logo URL is required'],
      default: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=200&q=80',
    },
    country: {
      type: String,
      required: [true, 'Country of registration/origin is required'],
      trim: true,
    },
    regulation: {
      type: String,
      required: [true, 'Primary regulation description is required'],
      trim: true,
    },
    regulators: [
      {
        type: String,
        trim: true,
      },
    ],
    leverage: {
      type: String,
      required: [true, 'Maximum leverage is required'],
      default: '1:500',
    },
    minDeposit: {
      type: Number,
      required: [true, 'Minimum deposit is required'],
      default: 0,
    },
    spreads: {
      type: String,
      required: [true, 'Spreads information is required'],
      default: 'From 0.0 pips',
    },
    execution: {
      type: String,
      required: [true, 'Execution type is required'],
      enum: ['ECN', 'STP', 'DMA', 'Market Maker', 'Hybrid (ECN/STP)'],
      default: 'Hybrid (ECN/STP)',
    },
    platforms: [
      {
        type: String,
        trim: true,
      },
    ],
    accountTypes: [accountTypeSchema],
    paymentMethods: [
      {
        type: String,
        trim: true,
      },
    ],
    website: {
      type: String,
      required: [true, 'Broker website URL is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Broker description is required'],
    },
    disclaimer: {
      type: String,
      default: 'Trading Forex and CFDs carries a high risk of capital loss. Please trade responsibly.',
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive'],
        message: '{VALUE} is not a valid broker status',
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
    documents: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        docType: { type: String, default: 'Regulatory License' },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for performance and sorting
brokerSchema.index({ name: 'text', country: 'text', description: 'text' });
brokerSchema.index({ createdAt: -1 });
brokerSchema.index({ status: 1, isFeatured: -1, createdAt: -1 });

// Cascade delete: when a Broker is deleted, remove all associated Reviews
brokerSchema.pre('findOneAndDelete', async function (next) {
  const doc = await this.model.findOne(this.getQuery());
  if (doc) {
    await mongoose.model('Review').deleteMany({ targetType: 'broker', targetId: doc._id });
  }
  next();
});

module.exports = mongoose.model('Broker', brokerSchema);

