import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { adminCreateUserSchema } from '../auth/auth.schemas';

const router = Router();

// Protect ALL admin routes with authentication and ADMIN role check
router.use(authenticate, authorize('ADMIN'));

// ── DASHBOARD ──────────────────────────────────────
router.get('/dashboard', adminController.getDashboardStats);
router.get('/stats', adminController.getDashboardStats);

// ── USERS ──────────────────────────────────────────
router.post('/users', validate(adminCreateUserSchema), adminController.createUser);
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);
router.post('/users/:id/reset-password', adminController.resetUserPassword);

// ── BROKERS ────────────────────────────────────────
router.get('/brokers/pending', adminController.getPendingBrokers);
router.get('/brokers', adminController.getAllBrokers);
router.post('/brokers', adminController.createBroker);
router.put('/brokers/:id', adminController.updateBroker);
router.delete('/brokers/:id', adminController.deleteBroker);
router.patch('/brokers/:id/status', adminController.updateBrokerStatus);
router.patch('/brokers/:id/feature', adminController.toggleBrokerFeatured);
router.patch('/reviews/broker/:id/approve', adminController.approveBrokerReview);
router.delete('/reviews/broker/:id', adminController.deleteBrokerReview);

// ── ACCOUNT MANAGERS ───────────────────────────────
router.get('/account-managers', adminController.getAllAMs);
router.post('/account-managers', adminController.createAM);
router.put('/account-managers/:id', adminController.updateAM);
router.delete('/account-managers/:id', adminController.deleteAM);
router.patch('/account-managers/:id/status', adminController.updateAMStatus);
router.patch('/account-managers/:id/feature', adminController.toggleAMFeatured);
router.patch('/reviews/am/:id/approve', adminController.approveAccountManagerReview);
router.delete('/reviews/am/:id', adminController.deleteAccountManagerReview);

// ── SIGNAL PROVIDERS ───────────────────────────────
router.get('/signal-providers', adminController.getAllSPs);
router.post('/signal-providers', adminController.createSP);
router.put('/signal-providers/:id', adminController.updateSP);
router.delete('/signal-providers/:id', adminController.deleteSP);
router.patch('/signal-providers/:id/status', adminController.updateSPStatus);
router.patch('/signal-providers/:id/verify', adminController.toggleSPVerification);
router.patch('/signal-providers/:id/feature', adminController.toggleSPFeatured);
router.patch('/reviews/sp/:id/approve', adminController.approveSignalProviderReview);
router.delete('/reviews/sp/:id', adminController.deleteSignalProviderReview);

// ── LMS TUTORS & COURSES ───────────────────────────
router.get('/tutors', adminController.getAllTutors);
router.patch('/tutors/:id/status', adminController.updateTutorStatus);

router.get('/courses/pending', adminController.getPendingCourses);
router.get('/courses', adminController.getAllCourses);
router.patch('/courses/:id/status', adminController.updateCourseStatus);
router.patch('/reviews/course/:id/approve', adminController.approveCourseReview);
router.delete('/reviews/course/:id', adminController.deleteCourseReview);

// ── PAYOUTS ────────────────────────────────────────
router.get('/payouts', adminController.getAllPayouts);
router.patch('/payouts/:id', adminController.processPayout);

// ── AUDIT LOGS ─────────────────────────────────────
router.get('/audit-logs', adminController.getAuditLogs);

// ── SITE SETTINGS & CMS CONTENT ────────────────────
router.get('/settings', adminController.getSiteSettings);
router.patch('/settings', adminController.updateSiteSetting);
router.get('/content', adminController.getWebsiteContent);
router.put('/content', adminController.updateWebsiteContent);

export default router;
