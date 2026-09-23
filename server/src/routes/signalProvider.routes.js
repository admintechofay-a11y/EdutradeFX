const express = require('express');
const router = express.Router();
const {
  getSignalProviders,
  getSignalProviderById,
  getMySignalProviderProfile,
  updateMySignalProviderProfile,
  submitMySignalProviderForApproval,
  getMySignals,
  createMySignal,
  updateMySignal,
  deleteMySignal,
  getMySubscribers,
  getMyReviews,
  replyMyReview,
  getAdminSignalProviders,
  updateSignalProviderApproval,
  createSignalProvider,
  updateSignalProvider,
  deleteSignalProvider,
} = require('../controllers/signalProvider.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public routes
router.get('/', getSignalProviders);

// Signal Provider Self-Service routes (Signal Provider or Admin)
router.get('/me/profile', protect, authorize('signal_provider', 'admin'), getMySignalProviderProfile);
router.put('/me/profile', protect, authorize('signal_provider', 'admin'), updateMySignalProviderProfile);
router.post('/me/submit', protect, authorize('signal_provider', 'admin'), submitMySignalProviderForApproval);
router.get('/me/signals', protect, authorize('signal_provider', 'admin'), getMySignals);
router.post('/me/signals', protect, authorize('signal_provider', 'admin'), createMySignal);
router.put('/me/signals/:id', protect, authorize('signal_provider', 'admin'), updateMySignal);
router.delete('/me/signals/:id', protect, authorize('signal_provider', 'admin'), deleteMySignal);
router.get('/me/subscribers', protect, authorize('signal_provider', 'admin'), getMySubscribers);
router.get('/me/reviews', protect, authorize('signal_provider', 'admin'), getMyReviews);
router.post('/me/reviews/:id/reply', protect, authorize('signal_provider', 'admin'), replyMyReview);

// Admin-only management routes
router.get('/admin/all', protect, authorize('admin'), getAdminSignalProviders);
router.patch('/admin/:id/approval', protect, authorize('admin'), updateSignalProviderApproval);
router.post('/', protect, authorize('admin'), createSignalProvider);
router.put('/:id', protect, authorize('admin'), updateSignalProvider);
router.delete('/:id', protect, authorize('admin'), deleteSignalProvider);

// Single provider lookup (placed after /me to avoid route collision)
router.get('/:id', getSignalProviderById);

module.exports = router;
