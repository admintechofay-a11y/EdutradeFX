const express = require('express');
const router = express.Router();
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  getMe,
  verifyEmail,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { authLimiter, loginLimiter } = require('../middleware/rateLimiter.middleware');
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} = require('../middleware/validator.middleware');

// Public auth routes with rate limiting and input validation
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', loginLimiter, validateLogin, login);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', authLimiter, validateForgotPassword, forgotPassword);
router.post('/reset-password/:token', authLimiter, validateResetPassword, resetPassword);
router.post('/refresh-token', authLimiter, refreshToken);
router.post('/logout', logout);

// Private profile route
router.get('/me', protect, getMe);

module.exports = router;
