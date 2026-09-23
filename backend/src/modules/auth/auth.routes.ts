import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  authLimiter,
  resetPasswordLimiter,
  refreshTokenLimiter,
} from '../../middleware/rateLimit.middleware';
import {
  registerSchema,
  partnerRegisterSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from './auth.schemas';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/register-partner', authLimiter, validate(partnerRegisterSchema), authController.registerPartner);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh-token', refreshTokenLimiter, authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.post('/forgot-password', resetPasswordLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', resetPasswordLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);
router.get('/me', authenticate, authController.getMe);
router.patch('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

export default router;
