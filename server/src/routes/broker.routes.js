const express = require('express');
const router = express.Router();
const {
  getBrokers,
  getBrokerById,
  compareBrokers,
  getMyBrokerProfile,
  updateMyBrokerProfile,
  submitMyBrokerForApproval,
  uploadMyBrokerDocument,
  getMyBrokerLeads,
  replyMyBrokerLead,
  getMyBrokerReviews,
  replyMyBrokerReview,
  getAdminBrokers,
  updateBrokerApproval,
  createBroker,
  updateBroker,
  deleteBroker,
  toggleFeatureBroker,
} = require('../controllers/broker.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public routes
router.get('/', getBrokers);
router.get('/compare', compareBrokers);

router.get('/me/profile', protect, authorize('broker', 'admin'), getMyBrokerProfile);
router.put('/me/profile', protect, authorize('broker', 'admin'), updateMyBrokerProfile);
router.post('/me/submit', protect, authorize('broker', 'admin'), submitMyBrokerForApproval);
router.get('/me/documents', protect, authorize('broker', 'admin'), async (req, res) => {
  try {
    const { Broker } = require('../models');
    const broker = await Broker.findOne({ user: req.user._id });
    res.json({ success: true, data: broker ? broker.documents : [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.post('/me/documents', protect, authorize('broker', 'admin'), uploadMyBrokerDocument);
router.get('/me/leads', protect, authorize('broker', 'admin'), getMyBrokerLeads);
router.post('/me/leads/:id/reply', protect, authorize('broker', 'admin'), replyMyBrokerLead);
router.get('/me/reviews', protect, authorize('broker', 'admin'), getMyBrokerReviews);
router.post('/me/reviews/:id/reply', protect, authorize('broker', 'admin'), replyMyBrokerReview);

// Admin-only management routes
router.get('/admin/all', protect, authorize('admin'), getAdminBrokers);
router.patch('/admin/:id/approval', protect, authorize('admin'), updateBrokerApproval);
router.post('/', protect, authorize('admin'), createBroker);
router.put('/:id', protect, authorize('admin'), updateBroker);
router.delete('/:id', protect, authorize('admin'), deleteBroker);
router.patch('/:id/feature', protect, authorize('admin'), toggleFeatureBroker);

// Single broker public lookup (kept after /me routes to avoid collision)
router.get('/:id', getBrokerById);

module.exports = router;
