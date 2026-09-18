import { Router } from 'express';
import { blogController } from './blog.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { generalLimiter, uploadLimiter } from '../../middleware/rateLimit.middleware';
import { uploadImage } from '../../middleware/upload.middleware';
import { createPostSchema, updatePostSchema } from './blog.schemas';

const router = Router();

// ── PUBLIC ─────────────────────────────────────────
router.get('/', generalLimiter, blogController.getPosts);
router.get('/categories', generalLimiter, blogController.getCategories);
router.get('/tags', generalLimiter, blogController.getTags);
router.get('/:slug', generalLimiter, blogController.getPostBySlug);

// ── ADMIN / AUTHOR ─────────────────────────────────
router.get('/admin/all', authenticate, authorize('ADMIN'), blogController.getAllPostsAdmin);

router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  uploadLimiter,
  uploadImage.single('featuredImage'),
  validate(createPostSchema),
  blogController.createPost
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  uploadLimiter,
  uploadImage.single('featuredImage'),
  validate(updatePostSchema),
  blogController.updatePost
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  blogController.deletePost
);

export default router;
