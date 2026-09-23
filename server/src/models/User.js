const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      index: true,
    },
    mobile: {
      type: String,
      trim: true,
      default: '',
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'broker', 'signal_provider', 'tutor', 'admin'],
        message: '{VALUE} is not a valid role',
      },
      default: 'user',
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'suspended'],
        message: '{VALUE} is not a valid status',
      },
      default: 'active',
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.index({ createdAt: -1 });


// Method to verify entered password against stored passwordHash
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Method to generate JWT Access Token (15 minutes) - payload contains userId, role, iat, exp only
userSchema.methods.getSignedAccessToken = function () {
  return jwt.sign(
    { userId: this._id.toString(), role: this.role },
    process.env.JWT_SECRET || 'edutradefx_super_secret_jwt_key_2026',
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );
};

// Method to generate JWT Refresh Token (7 days) - payload contains userId, role, iat, exp only
userSchema.methods.getSignedRefreshToken = function () {
  return jwt.sign(
    { userId: this._id.toString(), role: this.role },
    process.env.JWT_REFRESH_SECRET || 'edutradefx_super_secret_refresh_jwt_key_2026',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

// Backwards-compatible helper
userSchema.methods.getSignedJwtToken = function () {
  return this.getSignedAccessToken();
};

// Generate and hash email verification token (24 hours expiration)
userSchema.methods.getVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.verificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.verificationExpire = Date.now() + 24 * 60 * 60 * 1000;
  return token;
};

// Generate and hash password reset token (1 hour expiration)
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash token with sha256 and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire: exactly 1 hour (60 minutes)
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

  return resetToken;
};

// Static helper to hash password with 12 rounds
userSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
};

module.exports = mongoose.model('User', userSchema);
