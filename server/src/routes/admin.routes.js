const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAdminUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getAdminAuditLogs,
  getAdminPayouts,
  updatePayoutStatus,
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Protect all admin endpoints with admin role authorization
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/audit-logs', getAdminAuditLogs);
router.get('/payouts', getAdminPayouts);
router.patch('/payouts/:id', updatePayoutStatus);

module.exports = router;
