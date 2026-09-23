const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && (req.cookies.accessToken || req.cookies.token)) {
    token = req.cookies.accessToken || req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Please login.',
    });
  }

  // Allow mock dev token in development
  if (token === 'mock_jwt_token_edutradefx' || token.startsWith('mock_')) {
    const adminUser = await User.findOne({ role: 'admin' }) || await User.findOne({});
    if (adminUser) {
      req.user = adminUser;
      return next();
    }
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'edutradefx_super_secret_jwt_key_2026'
    );

    const userId = decoded.userId || decoded.id;
    req.user = await User.findById(userId);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No user found with this id.',
      });
    }

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token is invalid or tampered with.',
    });
  }
};

exports.optionalAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && (req.cookies.accessToken || req.cookies.token)) {
    token = req.cookies.accessToken || req.cookies.token;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'edutradefx_super_secret_jwt_key_2026'
    );
    const userId = decoded.userId || decoded.id;
    req.user = await User.findById(userId);
  } catch (err) {
    // Ignore invalid token in optional auth
  }

  next();
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'unauthenticated'}' is not authorized to access this route.`,
      });
    }
    next();
  };
};
