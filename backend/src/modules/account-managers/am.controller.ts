import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { accountManagerService } from './am.service';
import { sendSuccess, sendPaginated } from '../../utils/response.utils';
import { AuthenticatedRequest } from '../../types';
import { AppError } from '../../middleware/error.middleware';

export class AccountManagerController {
  getMyAMProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const profile = await accountManagerService.getMyAMProfile(req.user!.userId);
    sendSuccess(res, profile, 'Dashboard profile retrieved', StatusCodes.OK);
  };

  saveSection = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { section } = req.params;
    const updated = await accountManagerService.saveSection(req.user!.userId, section as string, req.body);
    sendSuccess(res, updated, `Section ${section} saved successfully`, StatusCodes.OK);
  };

  uploadPhoto = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.file) {
      throw new AppError('No photo file uploaded.', StatusCodes.BAD_REQUEST);
    }
    const result = await accountManagerService.uploadPhoto(req.user!.userId, req.file);
    sendSuccess(res, result, 'Photo uploaded successfully', StatusCodes.OK);
  };

  uploadDocument = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.file) {
      throw new AppError('No document file uploaded.', StatusCodes.BAD_REQUEST);
    }
    const { docType, caption, periodNote } = req.body;
    if (!docType) {
      throw new AppError('docType field is required.', StatusCodes.BAD_REQUEST);
    }

    const doc = await accountManagerService.uploadDocument(
      req.user!.userId,
      req.file,
      docType,
      caption,
      periodNote
    );
    sendSuccess(res, doc, 'Document uploaded successfully', StatusCodes.CREATED);
  };

  deleteDocument = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    await accountManagerService.deleteDocument(req.user!.userId, id as string);
    sendSuccess(res, null, 'Document deleted successfully', StatusCodes.OK);
  };

  getAgreements = async (req: Request, res: Response): Promise<void> => {
    const agreements = await accountManagerService.getAgreements();
    sendSuccess(res, agreements, 'Agreements retrieved', StatusCodes.OK);
  };

  acceptAgreements = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const result = await accountManagerService.acceptAgreements(
      req.user!.userId,
      req.body,
      ipAddress,
      userAgent
    );
    sendSuccess(res, result, 'Agreements accepted successfully', StatusCodes.OK);
  };

  submitOnboarding = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const am = await accountManagerService.submitOnboarding(req.user!.userId);
    sendSuccess(res, am, 'Onboarding application submitted for review', StatusCodes.OK);
  };

  getAccountManagers = async (req: Request, res: Response): Promise<void> => {
    const result = await accountManagerService.getAccountManagers(req.query);
    sendPaginated(res, result.accountManagers, result.total, result.page, result.limit, 'Account managers retrieved');
  };

  getAccountManagerBySlug = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { slug } = req.params;
    const am = await accountManagerService.getAccountManagerBySlug(slug as string, req.user?.userId);
    sendSuccess(res, am, 'Account Manager retrieved', StatusCodes.OK);
  };

  getMyEnquiries = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await accountManagerService.getMyEnquiries(req.user!.userId, req.query);
    sendPaginated(res, result.enquiries, result.total, result.page, result.limit, 'Enquiries retrieved');
  };

  markEnquiryRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const enquiry = await accountManagerService.markEnquiryRead(req.user!.userId, id as string);
    sendSuccess(res, enquiry, 'Inquiry marked as read', StatusCodes.OK);
  };

  addReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const review = await accountManagerService.addReview(id as string, req.user!.userId, req.body);
    sendSuccess(res, review, 'Review submitted successfully. Pending moderation.', StatusCodes.CREATED);
  };

  getReviews = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await accountManagerService.getReviews(id as string, req.query);
    sendPaginated(res, result.reviews, result.total, result.page, result.limit, 'Reviews retrieved');
  };

  sendEnquiry = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const enquiry = await accountManagerService.sendEnquiry(id as string, req.body, req.user?.userId);
    sendSuccess(res, enquiry, 'Inquiry submitted successfully', StatusCodes.CREATED);
  };

  // Backward compatible endpoints
  registerAccountManager = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const am = await accountManagerService.registerAccountManager(req.user!.userId, req.body);
    sendSuccess(res, am, 'Account Manager application submitted successfully.', StatusCodes.CREATED);
  };

  updateAccountManager = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const am = await accountManagerService.updateAccountManager(req.user!.userId, req.body);
    sendSuccess(res, am, 'Profile updated successfully', StatusCodes.OK);
  };
}

export const accountManagerController = new AccountManagerController();
