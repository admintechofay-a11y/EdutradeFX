const { body, param, query, validationResult } = require('express-validator');

// Middleware to check validation results and return formatted error response
exports.validate = (validations) => {
  return async (req, res, next) => {
    for (const validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  };
};

// Registration validation
exports.validateRegister = exports.validate([
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .escape(),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('mobile')
    .notEmpty()
    .withMessage('Mobile number is required')
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage('Mobile number must be exactly 10 digits'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^_\-])/)
    .withMessage(
      'Password must contain at least 1 uppercase letter, 1 number, and 1 special character (@$!%*?&#^_-)'
    ),
  body('consent')
    .custom((val) => val === true || val === 'true')
    .withMessage('You must agree to the terms of service and risk disclaimer'),
]);

// Login validation
exports.validateLogin = exports.validate([
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
]);

// Forgot password validation
exports.validateForgotPassword = exports.validate([
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Account email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
]);

// Reset password validation
exports.validateResetPassword = exports.validate([
  body('password')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^_\-])/)
    .withMessage(
      'Password must contain at least 1 uppercase letter, 1 number, and 1 special character (@$!%*?&#^_-)'
    ),
  param('token')
    .notEmpty()
    .withMessage('Reset token is missing in URL')
    .isHexadecimal()
    .withMessage('Invalid reset token format'),
]);

// Complaint filing validation
exports.validateComplaint = exports.validate([
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Complainant name is required')
    .escape(),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('company')
    .trim()
    .notEmpty()
    .withMessage('Broker / entity name is required')
    .escape(),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Dispute category is required'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Incident description is required')
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters long'),
  body('declaration')
    .custom((val) => val === true || val === 'true')
    .withMessage('You must accept the legal declaration to proceed'),
]);
