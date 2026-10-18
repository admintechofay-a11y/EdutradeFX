import { Router } from 'express';
import { userController } from './user.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { uploadLimiter } from '../../middleware/rateLimit.middleware';
import { uploadAvatarMemory } from '../../middleware/upload.middleware';
import { validate } from '../../middleware/validate.middleware';
import { updateProfileSchema } from './user.schemas';

const router = Router();

// Trader Profile
router.get('/me', authenticate, userController.getProfile);
router.get('/profile', authenticate, userController.getProfile);

router.patch('/me', authenticate, validate(updateProfileSchema), userController.updateProfile);
router.put('/profile', authenticate, validate(updateProfileSchema), userController.updateProfile);

router.post('/me/avatar', authenticate, uploadLimiter, uploadAvatarMemory.single('avatar'), userController.uploadAvatar);
router.delete('/me/avatar', authenticate, userController.removeAvatar);

router.get('/saved-brokers', authenticate, userController.getSavedBrokers);
router.get('/orders', authenticate, userController.getOrders);

export default router;
