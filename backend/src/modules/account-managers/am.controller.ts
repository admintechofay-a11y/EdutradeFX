import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { accountManagerService } from './am.service';
import { sendSuccess, sendPaginated } from '../../utils/response.utils';
import { AuthenticatedRequest } from '../../types';

export class AccountManagerController {
  registerAccountManager = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const photoFile = files?.['photo']?.[0];
    const docFiles = files?.['docs'];

    const am = await accountManagerService.registerAccountManager(
      req.user!.userId,
      req.body,
      photoFile,
      docFiles
    );
    sendSuccess(res, am, 'Account Manager application submitted successfully.', StatusCodes.CREATED);
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

  updateAccountManager = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const photoFile = req.file;
    const am = await accountManagerService.updateAccountManager(req.user!.userId, req.body, photoFile);
    sendSuccess(res, am, 'Profile updated successfully', StatusCodes.OK);
  };

  uploadDocuments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const files = req.files as Express.Multer.File[];
    await accountManagerService.uploadDocuments(req.user!.userId, files);
    sendSuccess(res, null, 'Documents uploaded successfully', StatusCodes.OK);
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

  getMyAMProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const profile = await accountManagerService.getMyAMProfile(req.user!.userId);
    sendSuccess(res, profile, 'Dashboard profile retrieved', StatusCodes.OK);
  };

  getMyEnquiries = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await accountManagerService.getMyEnquiries(req.user!.userId, req.query);
    sendPaginated(res, result.enquiries, result.total, result.page, result.limit, 'Enquiries retrieved');
  };
}

export const accountManagerController = new AccountManagerController();
