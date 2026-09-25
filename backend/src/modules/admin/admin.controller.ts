import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { adminService } from './admin.service';
import { authService } from '../auth/auth.service';
import { sendSuccess, sendPaginated } from '../../utils/response.utils';
import { AuthenticatedRequest } from '../../types';

export class AdminController {
  createUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await authService.adminCreateUser(req.body);
    await adminService.createAuditLog({
      actorId: req.user!.userId,
      action: 'CREATE_USER',
      targetType: 'USER',
      targetId: result.user.id,
      metadata: { role: req.body.role, email: req.body.email },
    });
    sendSuccess(res, result.user, result.message, StatusCodes.CREATED);
  };

  getDashboardStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const stats = await adminService.getDashboardStats();
    sendSuccess(res, stats, 'Dashboard KPIs retrieved', StatusCodes.OK);
  };

  getAllUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await adminService.getAllUsers(req.query);
    sendPaginated(res, result.users, result.total, result.page, result.limit, 'Users retrieved');
  };

  getUserById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const user = await adminService.getUserById(id as string);
    sendSuccess(res, user, 'User details retrieved', StatusCodes.OK);
  };

  updateUserStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { isActive } = req.body;
    const updated = await adminService.updateUserStatus(id as string, isActive);
    await adminService.createAuditLog({
      actorId: req.user!.userId,
      action: isActive ? 'ACTIVATE_USER' : 'SUSPEND_USER',
      targetType: 'USER',
      targetId: id as string,
      metadata: { isActive },
    });
    sendSuccess(res, updated, `User ${isActive ? 'activated' : 'suspended'}`, StatusCodes.OK);
  };

  deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await adminService.deleteUser(id as string, req.user!.userId);
    await adminService.createAuditLog({
      actorId: req.user!.userId,
      action: 'DELETE_USER',
      targetType: 'USER',
      targetId: id as string,
    });
    sendSuccess(res, null, result.message, StatusCodes.OK);
  };

  resetUserPassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await adminService.resetUserPassword(id as string);
    await adminService.createAuditLog({
      actorId: req.user!.userId,
      action: 'RESET_PASSWORD',
      targetType: 'USER',
      targetId: id as string,
    });
    sendSuccess(res, null, result.message, StatusCodes.OK);
  };

  // Brokers
  getAllBrokers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await adminService.getAllBrokersAdmin(req.query);
    sendPaginated(res, result.brokers, result.total, result.page, result.limit, 'Brokers retrieved');
  };

  updateBrokerStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const broker = await adminService.updateBrokerStatus(id as string, status, rejectionReason);
    await adminService.createAuditLog({
      actorId: req.user!.userId,
      action: `UPDATE_STATUS_${status}`,
      targetType: 'BROKER',
      targetId: id as string,
      metadata: { status, rejectionReason },
    });
    sendSuccess(res, broker, `Broker status updated to ${status}`, StatusCodes.OK);
  };

  toggleBrokerFeatured = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { isFeatured } = req.body;
    const broker = await adminService.toggleBrokerFeatured(id as string, isFeatured);
    await adminService.createAuditLog({
      actorId: req.user!.userId,
      action: isFeatured ? 'FEATURE_BROKER' : 'UNFEATURE_BROKER',
      targetType: 'BROKER',
      targetId: id as string,
      metadata: { isFeatured },
    });
    sendSuccess(res, broker, `Broker ${isFeatured ? 'featured' : 'unfeatured'}`, StatusCodes.OK);
  };

  approveBrokerReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const review = await adminService.approveBrokerReview(id as string);
    await adminService.createAuditLog({
      actorId: req.user!.userId,
      action: 'APPROVE_REVIEW',
      targetType: 'BROKER_REVIEW',
      targetId: id as string,
    });
    sendSuccess(res, review, 'Review approved and published', StatusCodes.OK);
  };

  deleteBrokerReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await adminService.deleteBrokerReview(id as string);
    await adminService.createAuditLog({
      actorId: req.user!.userId,
      action: 'DELETE_REVIEW',
      targetType: 'BROKER_REVIEW',
      targetId: id as string,
    });
    sendSuccess(res, null, result.message, StatusCodes.OK);
  };

  approveAccountManagerReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const review = await adminService.approveAccountManagerReview(id as string);
    await adminService.createAuditLog({
      actorId: req.user!.userId,
      action: 'APPROVE_REVIEW',
      targetType: 'AM_REVIEW',
      targetId: id as string,
    });
    sendSuccess(res, review, 'Account manager review approved and published', StatusCodes.OK);
  };

  deleteAccountManagerReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await adminService.deleteAccountManagerReview(id as string);
    await adminService.createAuditLog({
      actorId: req.user!.userId,
      action: 'DELETE_REVIEW',
      targetType: 'AM_REVIEW',
      targetId: id as string,
    });
    sendSuccess(res, null, result.message, StatusCodes.OK);
  };

  approveSignalProviderReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const review = await adminService.approveSignalProviderReview(id as string);
    await adminService.createAuditLog({
      actorId: req.user!.userId,
      action: 'APPROVE_REVIEW',
      targetType: 'SP_REVIEW',
      targetId: id as string,
    });
    sendSuccess(res, review, 'Signal provider review approved and published', StatusCodes.OK);
  };

  deleteSignalProviderReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await adminService.deleteSignalProviderReview(id as string);
    await adminService.createAuditLog({
      actorId: req.user!.userId,
      action: 'DELETE_REVIEW',
      targetType: 'SP_REVIEW',
      targetId: id as string,
    });
    sendSuccess(res, null, result.message, StatusCodes.OK);
  };

  approveCourseReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const review = await adminService.approveCourseReview(id as string);
    await adminService.createAuditLog({
      actorId: req.user!.userId,
      action: 'APPROVE_REVIEW',
      targetType: 'COURSE_REVIEW',
      targetId: id as string,
    });
    sendSuccess(res, review, 'Course review approved and published', StatusCodes.OK);
  };

  deleteCourseReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await adminService.deleteCourseReview(id as string);
    await adminService.createAuditLog({
      actorId: req.user!.userId,
      action: 'DELETE_REVIEW',
      targetType: 'COURSE_REVIEW',
      targetId: id as string,
    });
    sendSuccess(res, null, result.message, StatusCodes.OK);
  };

  createBroker = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const broker = await adminService.createBrokerAdmin(req.body);
    await adminService.createAuditLog({
      actorId: req.user!.userId,
      action: 'CREATE_BROKER',
      targetType: 'BROKER',
      targetId: broker.id,
      metadata: { companyName: broker.companyName },
    });
    sendSuccess(res, broker, 'Broker created successfully', StatusCodes.CREATED);
  };

  updateBroker = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const broker = await adminService.updateBrokerAdmin(id as string, req.body);
    await adminService.createAuditLog({
      actorId: req.user!.userId,
      action: 'UPDATE_BROKER',
      targetType: 'BROKER',
      targetId: id as string,
      metadata: req.body,
    });
    sendSuccess(res, broker, 'Broker updated successfully', StatusCodes.OK);
  };

  deleteBroker = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await adminService.deleteBrokerAdmin(id as string);
    await adminService.createAuditLog({
      actorId: req.user!.userId,
      action: 'DELETE_BROKER',
      targetType: 'BROKER',
      targetId: id as string,
    });
    sendSuccess(res, null, result.message, StatusCodes.OK);
  };

  // Account Managers
  getAllAMs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await adminService.getAllAMsAdmin(req.query);
    sendPaginated(res, result.accountManagers, result.total, result.page, result.limit, 'Account managers retrieved');
  };

  updateAMStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status } = req.body;
    const am = await adminService.updateAMStatus(id as string, status);
    await adminService.createAuditLog({
      actorId: req.user!.userId,
      action: `UPDATE_STATUS_${status}`,
      targetType: 'ACCOUNT_MANAGER',
      targetId: id as string,
      metadata: { status },
    });
    sendSuccess(res, am, `Account Manager status updated to ${status}`, StatusCodes.OK);
  };

  toggleAMFeatured = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { isFeatured } = req.body;
    const am = await adminService.toggleAMFeatured(id as string, isFeatured);
    await adminService.createAuditLog({
      actorId: req.user!.userId,
      action: isFeatured ? 'FEATURE_AM' : 'UNFEATURE_AM',
      targetType: 'ACCOUNT_MANAGER',
      targetId: id as string,
      metadata: { isFeatured },
    });
    sendSuccess(res, am, `Account Manager ${isFeatured ? 'featured' : 'unfeatured'}`, StatusCodes.OK);
  };

  createAM = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const am = await adminService.createAMAdmin(req.body);
    await adminService.createAuditLog({
      actorId: req.user!.userId,
      action: 'CREATE_AM',
      targetType: 'ACCOUNT_MANAGER',
      targetId: am.id,
      metadata: { fullName: am.fullName },
    });
    sendSuccess(res, am, 'Account Manager created successfully', StatusCodes.CREATED);
  };

  updateAM = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const am = await adminService.updateAMAdmin(id as string, req.body);
    await adminService.createAuditLog({
      actorId: req.user!.userId,
      action: 'UPDATE_AM',
      targetType: 'ACCOUNT_MANAGER',
      targetId: id as string,
      metadata: req.body,
    });
    sendSuccess(res, am, 'Account Manager updated successfully', StatusCodes.OK);
  };

  deleteAM = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await adminService.deleteAMAdmin(id as string);
    await adminService.createAuditLog({
      actorId: req.user!.userId,
      action: 'DELETE_AM',
      targetType: 'ACCOUNT_MANAGER',
      targetId: id as string,
    });
    sendSuccess(res, null, result.message, StatusCodes.OK);
  };

  // Signal Providers
  getAllSPs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await adminService.getAllSPsAdmin(req.query);
    sendPaginated(res, result.signalProviders, result.total, result.page, result.limit, 'Signal providers retrieved');
  };

  updateSPStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status } = req.body;
    const sp = await adminService.updateSPStatus(id as string, status);
    await adminService.createAuditLog({
      actorId: req.user!.userId,
      action: `UPDATE_STATUS_${status}`,
      targetType: 'SIGNAL_PROVIDER',
      targetId: id as string,
      metadata: { status },
    });
    sendSuccess(res, sp, `Signal Provider status updated to ${status}`, StatusCodes.OK);
  };

  toggleSPVerification = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { verificationStatus } = req.body;
    const sp = await adminService.toggleSPVerification(id as string, verificationStatus);
    await adminService.createAuditLog({
      actorId: req.user!.userId,
      action: verificationStatus ? 'VERIFY_SP' : 'UNVERIFY_SP',
      targetType: 'SIGNAL_PROVIDER',
      targetId: id as string,
      metadata: { verificationStatus },
    });
    sendSuccess(res, sp, `Verification status set to ${verificationStatus}`, StatusCodes.OK);
  };

  toggleSPFeatured = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { isFeatured } = req.body;
    const sp = await adminService.toggleSPFeatured(id as string, isFeatured);
    await adminService.createAuditLog({
      actorId: req.user!.userId,
      action: isFeatured ? 'FEATURE_SP' : 'UNFEATURE_SP',
      targetType: 'SIGNAL_PROVIDER',
      targetId: id as string,
      metadata: { isFeatured },
    });
    sendSuccess(res, sp, `Signal Provider ${isFeatured ? 'featured' : 'unfeatured'}`, StatusCodes.OK);
  };

  createSP = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const sp = await adminService.createSPAdmin(req.body);
    await adminService.createAuditLog({
      actorId: req.user!.userId,
      action: 'CREATE_SP',
      targetType: 'SIGNAL_PROVIDER',
      targetId: sp.id,
      metadata: { displayName: sp.displayName },
    });
    sendSuccess(res, sp, 'Signal Provider created successfully', StatusCodes.CREATED);
  };

  updateSP = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const sp = await adminService.updateSPAdmin(id as string, req.body);
    await adminService.createAuditLog({
      actorId: req.user!.userId,
      action: 'UPDATE_SP',
      targetType: 'SIGNAL_PROVIDER',
      targetId: id as string,
      metadata: req.body,
    });
    sendSuccess(res, sp, 'Signal Provider updated successfully', StatusCodes.OK);
  };

  deleteSP = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await adminService.deleteSPAdmin(id as string);
    await adminService.createAuditLog({
      actorId: req.user!.userId,
      action: 'DELETE_SP',
      targetType: 'SIGNAL_PROVIDER',
      targetId: id as string,
    });
    sendSuccess(res, null, result.message, StatusCodes.OK);
  };

  // Tutors & Courses
  getAllTutors = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await adminService.getAllTutorsAdmin(req.query);
    sendPaginated(res, result.tutors, result.total, result.page, result.limit, 'Tutors retrieved');
  };

  updateTutorStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status } = req.body;
    const tutor = await adminService.updateTutorStatus(id as string, status);
    await adminService.createAuditLog({
      actorId: req.user!.userId,
      action: `UPDATE_STATUS_${status}`,
      targetType: 'TUTOR',
      targetId: id as string,
      metadata: { status },
    });
    sendSuccess(res, tutor, `Tutor status set to ${status}`, StatusCodes.OK);
  };

  getAllCourses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await adminService.getAllCoursesAdmin(req.query);
    sendPaginated(res, result.courses, result.total, result.page, result.limit, 'Courses retrieved');
  };

  updateCourseStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const course = await adminService.updateCourseStatus(id as string, status, rejectionReason);
    await adminService.createAuditLog({
      actorId: req.user!.userId,
      action: `UPDATE_STATUS_${status}`,
      targetType: 'COURSE',
      targetId: id as string,
      metadata: { status, rejectionReason },
    });
    sendSuccess(res, course, `Course status set to ${status}`, StatusCodes.OK);
  };

  // Payouts
  getAllPayouts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await adminService.getAllPayoutsAdmin(req.query);
    sendPaginated(res, result.payouts, result.total, result.page, result.limit, 'Payouts retrieved');
  };

  processPayout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status, notes } = req.body;
    const payout = await adminService.processPayout(id as string, status, notes);
    await adminService.createAuditLog({
      actorId: req.user!.userId,
      action: `PROCESS_PAYOUT_${status}`,
      targetType: 'PAYOUT',
      targetId: id as string,
      metadata: { status, notes },
    });
    sendSuccess(res, payout, `Payout status updated to ${status}`, StatusCodes.OK);
  };

  // Site Settings
  getSiteSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const settings = await adminService.getSiteSettings();
    sendSuccess(res, settings, 'Site settings retrieved', StatusCodes.OK);
  };

  updateSiteSetting = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { key, value } = req.body;
    const setting = await adminService.updateSiteSetting(key, String(value));
    await adminService.createAuditLog({
      actorId: req.user!.userId,
      action: 'UPDATE_SETTING',
      targetType: 'SITE_SETTING',
      targetId: key,
      metadata: { value },
    });
    sendSuccess(res, setting, `Setting '${key}' updated`, StatusCodes.OK);
  };

  // Audit Logs
  getAuditLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await adminService.getAuditLogs(req.query);
    sendPaginated(res, result.logs, result.total, result.page, result.limit, 'Audit logs retrieved');
  };

  // CMS Website Content
  getWebsiteContent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { section } = req.query;
    const content = await adminService.getWebsiteContent(section as string);
    sendSuccess(res, content, 'Website content retrieved', StatusCodes.OK);
  };

  updateWebsiteContent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { section, content } = req.body;
    const result = await adminService.updateWebsiteContent(section, content);
    await adminService.createAuditLog({
      actorId: req.user!.userId,
      action: 'UPDATE_CMS_CONTENT',
      targetType: 'CMS_CONTENT',
      targetId: section,
      metadata: { section },
    });
    sendSuccess(res, result, `Website content for '${section}' updated`, StatusCodes.OK);
  };
}

export const adminController = new AdminController();
