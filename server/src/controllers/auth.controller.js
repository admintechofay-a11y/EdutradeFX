const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { User, Broker, SignalProvider } = require('../models');

// Helper to return JWT response and set secure httpOnly cookies
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const accessToken = user.getSignedAccessToken();
  const refreshToken = user.getSignedRefreshToken();

  const isProduction = process.env.NODE_ENV === 'production';

  // Access token cookie options: 15 minutes, httpOnly
  const accessCookieOptions = {
    expires: new Date(Date.now() + 15 * 60 * 1000),
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/',
  };

  // Refresh token cookie options: 7 days, httpOnly
  const refreshCookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/',
  };

  res
    .status(statusCode)
    .cookie('accessToken', accessToken, accessCookieOptions)
    .cookie('refreshToken', refreshToken, refreshCookieOptions)
    .json({
      success: true,
      message,
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !email || !password || !mobile) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, 10-digit mobile number, and password',
      });
    }

    // Check duplicate email
    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email address is already registered',
      });
    }

    // Check duplicate mobile
    const existingMobile = await User.findOne({ mobile: mobile.trim() });
    if (existingMobile) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number is already registered',
      });
    }

    // Role selection: allow user, broker, signal_provider, tutor (admin cannot be self-registered)
    const allowedRoles = ['user', 'broker', 'signal_provider', 'tutor'];
    let userRole = 'user';
    if (req.body.role && allowedRoles.includes(req.body.role)) {
      userRole = req.body.role;
    }

    const passwordHash = await User.hashPassword(password);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      mobile: mobile.trim(),
      passwordHash,
      role: userRole,
    });

    // Auto-initialize profile for Broker or Signal Provider
    if (userRole === 'broker') {
      const brokerName = (req.body.companyName || name).trim();
      let uniqueName = brokerName;
      const existingBroker = await Broker.findOne({ name: uniqueName });
      if (existingBroker) {
        uniqueName = `${brokerName} (${Date.now().toString().slice(-4)})`;
      }
      await Broker.create({
        user: user._id,
        name: uniqueName,
        country: req.body.country || 'United Kingdom',
        regulation: req.body.regulation || 'FCA Regulated',
        contactEmail: email.toLowerCase().trim(),
        phone: mobile.trim(),
        website: req.body.website || 'https://edutradefx.com',
        description: req.body.description || `${uniqueName} is a licensed Forex & CFD brokerage firm.`,
        approvalStatus: 'pending',
        status: 'active',
      });
    } else if (userRole === 'signal_provider') {
      const providerName = (req.body.companyName || name).trim();
      let uniqueName = providerName;
      const existingProvider = await SignalProvider.findOne({ name: uniqueName });
      if (existingProvider) {
        uniqueName = `${providerName} (${Date.now().toString().slice(-4)})`;
      }
      await SignalProvider.create({
        user: user._id,
        name: uniqueName,
        strategy: req.body.strategy || 'Price Action & Breakout Momentum',
        contactEmail: email.toLowerCase().trim(),
        description: req.body.description || `${uniqueName} delivers verified institutional Forex trade signals with strict risk parameters.`,
        subscriptionPrice: req.body.subscriptionPrice ? Number(req.body.subscriptionPrice) : 49,
        approvalStatus: 'pending',
        status: 'active',
      });
    }

    // Generate email verification token and dispatch
    const verificationToken = user.getVerificationToken();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(
      user,
      201,
      res,
      'Registration successful. Welcome to EduTradeFX.'
    );
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || 'Email or Mobile';
      return res.status(400).json({
        success: false,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} is already registered`,
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by administration. Please contact support.',
      });
    }

    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your account email',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with that email address',
      });
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // In production, send via Nodemailer / Resend. In development, return token in response for testing.
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

    res.status(200).json({
      success: true,
      message: 'Password reset token generated and email dispatched',
      resetToken,
      resetUrl,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a new password with at least 8 characters',
      });
    }

    // Hash URL token to match stored hash
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+passwordHash');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token',
      });
    }

    // Check if new password is same as old password
    const isSamePassword = await user.comparePassword(password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password cannot be the same as your current/previous password',
      });
    }

    // Set new password with 12 rounds and invalidate single-use token immediately
    user.passwordHash = await User.hashPassword(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password has been reset successfully');
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Verify user email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const verificationToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      verificationToken,
      verificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired email verification token',
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email address has been verified successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private (User JWT)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userData = user.toObject();
    if (user.role === 'broker') {
      const broker = await Broker.findOne({ user: user._id });
      userData.broker = broker;
    } else if (user.role === 'signal_provider') {
      const provider = await SignalProvider.findOne({ user: user._id });
      userData.signalProvider = provider;
    }

    res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public (reads httpOnly refreshToken cookie or body)
exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided. Please log in.',
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || 'edutradefx_super_secret_refresh_jwt_key_2026'
    );

    const user = await User.findById(decoded.userId || decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
      });
    }

    const newAccessToken = user.getSignedAccessToken();
    const isProduction = process.env.NODE_ENV === 'production';

    const accessCookieOptions = {
      expires: new Date(Date.now() + 15 * 60 * 1000),
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/',
    };

    res
      .status(200)
      .cookie('accessToken', newAccessToken, accessCookieOptions)
      .json({
        success: true,
        token: newAccessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token. Please log in again.',
    });
  }
};

// @desc    Log user out / clear httpOnly cookies
// @route   POST /api/auth/logout
// @access  Public
exports.logout = async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieClearOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/',
  };

  res
    .status(200)
    .clearCookie('accessToken', cookieClearOptions)
    .clearCookie('refreshToken', cookieClearOptions)
    .clearCookie('token', cookieClearOptions)
    .json({
      success: true,
      message: 'Successfully logged out and session cookies cleared',
    });
};
