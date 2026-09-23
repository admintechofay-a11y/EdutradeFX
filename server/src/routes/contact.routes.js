const express = require('express');
const router = express.Router();
const {
  createContactEnquiry,
  getContactEnquiries,
} = require('../controllers/contact.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public route
router.post('/', createContactEnquiry);

// Admin-only route
router.get('/', protect, authorize('admin'), getContactEnquiries);

module.exports = router;
