const express = require('express');
const router = express.Router();
const {
  getAccountManagers,
  getAccountManagerById,
  createAccountManager,
  updateAccountManager,
  deleteAccountManager,
} = require('../controllers/accountManager.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public routes
router.get('/', getAccountManagers);
router.get('/:id', getAccountManagerById);

// Admin routes
router.post('/', protect, authorize('admin'), createAccountManager);
router.put('/:id', protect, authorize('admin'), updateAccountManager);
router.delete('/:id', protect, authorize('admin'), deleteAccountManager);

module.exports = router;
