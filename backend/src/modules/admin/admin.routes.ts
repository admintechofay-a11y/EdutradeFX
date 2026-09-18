import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';

const router = Router();

// Protect ALL admin routes with authentication and ADMIN role check
router.use(authenticate, authorize('ADMIN'));

// ── DASHBOARD ──────────────────────────────────────
router.get('/dashboard', adminController.getDashboardStats);

// ── USERS ──────────────────────────────────────────
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);
router.post('/users/:id/reset-password', adminController.resetUserPassword);

// ── BROKERS ────────────────────────────────────────
router.get('/brokers', adminController.getAllBrokers);
router.patch('/brokers/:id/status', adminController.updateBrokerStatus);
router.patch('/brokers/:id/feature', adminController.toggleBrokerFeatured);
router.patch('/reviews/broker/:id/approve', adminController.approveBrokerReview);
router.delete('/reviews/broker/:id', adminController.deleteBrokerReview);

// ── ACCOUNT MANAGERS ───────────────────────────────
router.get('/account-managers', adminController.getAllAMs);
router.patch('/account-managers/:id/status', adminController.updateAMStatus);
router.patch('/account-managers/:id/feature', adminController.toggleAMFeatured);

// ── SIGNAL PROVIDERS ───────────────────────────────
router.get('/signal-providers', adminController.getAllSPs);
router.patch('/signal-providers/:id/status', adminController.updateSPStatus);
router.patch('/signal-providers/:id/verify', adminController.toggleSPVerification);
router.patch('/signal-providers/:id/feature', adminController.toggleSPFeatured);

// ── LMS TUTORS & COURSES ───────────────────────────
router.get('/tutors', adminController.getAllTutors);
router.patch('/tutors/:id/status', adminController.updateTutorStatus);

router.get('/courses', adminController.getAllCourses);
router.patch('/courses/:id/status', adminController.updateCourseStatus);

// ── PAYOUTS ────────────────────────────────────────
router.get('/payouts', adminController.getAllPayouts);
router.patch('/payouts/:id', adminController.processPayout);

// ── SITE SETTINGS ──────────────────────────────────
router.get('/settings', adminController.getSiteSettings);
router.patch('/settings', adminController.updateSiteSetting);

export default router;
