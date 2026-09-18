import { Router } from 'express';
import { userController } from './user.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { uploadLimiter } from '../../middleware/rateLimit.middleware';
import { uploadImage } from '../../middleware/upload.middleware';

const router = Router();

router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, uploadLimiter, uploadImage.single('avatar'), userController.updateProfile);
router.get('/saved-brokers', authenticate, userController.getSavedBrokers);
router.get('/orders', authenticate, userController.getOrders);

export default router;
