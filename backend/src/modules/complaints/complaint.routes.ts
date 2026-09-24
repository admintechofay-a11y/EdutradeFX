import { Router } from 'express';
import { complaintController } from './complaint.controller';
import { authenticate, optionalAuth } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { uploadLimiter } from '../../middleware/rateLimit.middleware';
import { uploadDocument } from '../../middleware/upload.middleware';
import { createComplaintSchema, updateComplaintSchema } from './complaint.schemas';

const router = Router();

// ── USER / PUBLIC DISPUTES ─────────────────────────
router.post(
  '/',
  optionalAuth,
  uploadLimiter,
  uploadDocument.array('attachments', 5),
  validate(createComplaintSchema),
  complaintController.submitComplaint
);

router.get('/my', authenticate, complaintController.getMyComplaints);
router.get('/:id', authenticate, complaintController.getComplaintById);

// ── ADMIN COMPLAINT MANAGEMENT ─────────────────────
router.get('/admin/all', authenticate, authorize('ADMIN'), complaintController.getAllComplaintsAdmin);
router.patch('/admin/:id', authenticate, authorize('ADMIN'), validate(updateComplaintSchema), complaintController.updateComplaint);

export default router;
