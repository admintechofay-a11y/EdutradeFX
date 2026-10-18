import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  authLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
  refreshTokenLimiter,
  checkEmailLimiter,
  resendVerificationLimiter,
} from '../../middleware/rateLimit.middleware';
import {
  registerSchema,
  partnerRegisterSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  resendVerificationSchema,
} from './auth.schemas';

const router = Router();

router.get('/check-email', checkEmailLimiter, authController.checkEmail);
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/register-partner', authLimiter, validate(partnerRegisterSchema), authController.registerPartner);
router.post('/resend-verification', resendVerificationLimiter, validate(resendVerificationSchema), authController.resendVerification);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh-token', refreshTokenLimiter, authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.post('/forgot-password', forgotPasswordLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', resetPasswordLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);
router.get('/me', authenticate, authController.getMe);
router.patch('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

export default router;
