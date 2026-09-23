const express = require('express');
const router = express.Router();
const {
  getAllManagers,
  getManagerById,
  createManager,
  updateManager,
  deleteManager,
} = require('../controllers/manager.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', getAllManagers);
router.get('/:id', getManagerById);

// Submit / Create profile
router.post('/', protect, createManager);

// Admin routes
router.put('/:id', protect, authorize('admin'), updateManager);
router.delete('/:id', protect, authorize('admin'), deleteManager);

module.exports = router;
