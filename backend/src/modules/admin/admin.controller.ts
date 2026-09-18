import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { adminService } from './admin.service';
import { sendSuccess, sendPaginated } from '../../utils/response.utils';

export class AdminController {
  getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    const stats = await adminService.getDashboardStats();
    sendSuccess(res, stats, 'Dashboard KPIs retrieved', StatusCodes.OK);
  };

  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    const result = await adminService.getAllUsers(req.query);
    sendPaginated(res, result.users, result.total, result.page, result.limit, 'Users retrieved');
  };

  getUserById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const user = await adminService.getUserById(id as string);
    sendSuccess(res, user, 'User details retrieved', StatusCodes.OK);
  };

  updateUserStatus = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { isActive } = req.body;
    const updated = await adminService.updateUserStatus(id as string, isActive);
    sendSuccess(res, updated, `User ${isActive ? 'activated' : 'suspended'}`, StatusCodes.OK);
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await adminService.deleteUser(id as string);
    sendSuccess(res, null, result.message, StatusCodes.OK);
  };

  resetUserPassword = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await adminService.resetUserPassword(id as string);
    sendSuccess(res, null, result.message, StatusCodes.OK);
  };

  // Brokers
  getAllBrokers = async (req: Request, res: Response): Promise<void> => {
    const result = await adminService.getAllBrokersAdmin(req.query);
    sendPaginated(res, result.brokers, result.total, result.page, result.limit, 'Brokers retrieved');
  };

  updateBrokerStatus = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const broker = await adminService.updateBrokerStatus(id as string, status, rejectionReason);
    sendSuccess(res, broker, `Broker status updated to ${status}`, StatusCodes.OK);
  };

  toggleBrokerFeatured = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { isFeatured } = req.body;
    const broker = await adminService.toggleBrokerFeatured(id as string, isFeatured);
    sendSuccess(res, broker, `Broker ${isFeatured ? 'featured' : 'unfeatured'}`, StatusCodes.OK);
  };

  approveBrokerReview = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const review = await adminService.approveBrokerReview(id as string);
    sendSuccess(res, review, 'Review approved and published', StatusCodes.OK);
  };

  deleteBrokerReview = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await adminService.deleteBrokerReview(id as string);
    sendSuccess(res, null, result.message, StatusCodes.OK);
  };

  // Account Managers
  getAllAMs = async (req: Request, res: Response): Promise<void> => {
    const result = await adminService.getAllAMsAdmin(req.query);
    sendPaginated(res, result.accountManagers, result.total, result.page, result.limit, 'Account managers retrieved');
  };

  updateAMStatus = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status } = req.body;
    const am = await adminService.updateAMStatus(id as string, status);
    sendSuccess(res, am, `Account Manager status updated to ${status}`, StatusCodes.OK);
  };

  toggleAMFeatured = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { isFeatured } = req.body;
    const am = await adminService.toggleAMFeatured(id as string, isFeatured);
    sendSuccess(res, am, `Account Manager ${isFeatured ? 'featured' : 'unfeatured'}`, StatusCodes.OK);
  };

  // Signal Providers
  getAllSPs = async (req: Request, res: Response): Promise<void> => {
    const result = await adminService.getAllSPsAdmin(req.query);
    sendPaginated(res, result.signalProviders, result.total, result.page, result.limit, 'Signal providers retrieved');
  };

  updateSPStatus = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status } = req.body;
    const sp = await adminService.updateSPStatus(id as string, status);
    sendSuccess(res, sp, `Signal Provider status updated to ${status}`, StatusCodes.OK);
  };

  toggleSPVerification = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { verificationStatus } = req.body;
    const sp = await adminService.toggleSPVerification(id as string, verificationStatus);
    sendSuccess(res, sp, `Verification status set to ${verificationStatus}`, StatusCodes.OK);
  };

  toggleSPFeatured = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { isFeatured } = req.body;
    const sp = await adminService.toggleSPFeatured(id as string, isFeatured);
    sendSuccess(res, sp, `Signal Provider ${isFeatured ? 'featured' : 'unfeatured'}`, StatusCodes.OK);
  };

  // Tutors & Courses
  getAllTutors = async (req: Request, res: Response): Promise<void> => {
    const result = await adminService.getAllTutorsAdmin(req.query);
    sendPaginated(res, result.tutors, result.total, result.page, result.limit, 'Tutors retrieved');
  };

  updateTutorStatus = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status } = req.body;
    const tutor = await adminService.updateTutorStatus(id as string, status);
    sendSuccess(res, tutor, `Tutor status set to ${status}`, StatusCodes.OK);
  };

  getAllCourses = async (req: Request, res: Response): Promise<void> => {
    const result = await adminService.getAllCoursesAdmin(req.query);
    sendPaginated(res, result.courses, result.total, result.page, result.limit, 'Courses retrieved');
  };

  updateCourseStatus = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const course = await adminService.updateCourseStatus(id as string, status, rejectionReason);
    sendSuccess(res, course, `Course status set to ${status}`, StatusCodes.OK);
  };

  // Payouts
  getAllPayouts = async (req: Request, res: Response): Promise<void> => {
    const result = await adminService.getAllPayoutsAdmin(req.query);
    sendPaginated(res, result.payouts, result.total, result.page, result.limit, 'Payouts retrieved');
  };

  processPayout = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status, notes } = req.body;
    const payout = await adminService.processPayout(id as string, status, notes);
    sendSuccess(res, payout, `Payout status updated to ${status}`, StatusCodes.OK);
  };

  // Site Settings
  getSiteSettings = async (req: Request, res: Response): Promise<void> => {
    const settings = await adminService.getSiteSettings();
    sendSuccess(res, settings, 'Site settings retrieved', StatusCodes.OK);
  };

  updateSiteSetting = async (req: Request, res: Response): Promise<void> => {
    const { key, value } = req.body;
    const setting = await adminService.updateSiteSetting(key, String(value));
    sendSuccess(res, setting, `Setting '${key}' updated`, StatusCodes.OK);
  };
}

export const adminController = new AdminController();
