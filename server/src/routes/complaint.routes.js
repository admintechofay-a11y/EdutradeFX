const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  updateComplaint,
} = require('../controllers/complaint.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { validateComplaint } = require('../middleware/validator.middleware');
const { uploadMultiple } = require('../middleware/upload.middleware');

// Public route: submit complaint with file upload support & input validation
router.post(
  '/',
  uploadMultiple.array('documents', 5),
  validateComplaint,
  createComplaint
);

// Admin-only routes (protected with admin role check)
router.get('/', protect, authorize('admin'), getComplaints);
router.patch('/:id', protect, authorize('admin'), updateComplaint);

module.exports = router;
