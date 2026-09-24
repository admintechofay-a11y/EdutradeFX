import { Router } from 'express';
import { contactController } from './contact.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { generalLimiter } from '../../middleware/rateLimit.middleware';
import { createContactEnquirySchema, updateContactEnquirySchema } from './contact.schemas';

const router = Router();

// Public: Contact form submission
router.post(
  '/',
  generalLimiter,
  validate(createContactEnquirySchema),
  contactController.submitEnquiry
);

// Admin: Manage contact enquiries
router.get(
  '/admin',
  authenticate,
  authorize('ADMIN'),
  contactController.getAllEnquiriesAdmin
);

router.get(
  '/admin/:id',
  authenticate,
  authorize('ADMIN'),
  contactController.getEnquiryByIdAdmin
);

router.patch(
  '/admin/:id',
  authenticate,
  authorize('ADMIN'),
  validate(updateContactEnquirySchema),
  contactController.updateEnquiryAdmin
);

router.delete(
  '/admin/:id',
  authenticate,
  authorize('ADMIN'),
  contactController.deleteEnquiryAdmin
);

export default router;
