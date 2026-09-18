import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { signalProviderService } from './sp.service';
import { sendSuccess, sendPaginated } from '../../utils/response.utils';
import { AuthenticatedRequest } from '../../types';

export class SignalProviderController {
  registerSignalProvider = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const photoFile = files?.['photo']?.[0];
    const docFiles = files?.['docs'];

    const sp = await signalProviderService.registerSignalProvider(
      req.user!.userId,
      req.body,
      photoFile,
      docFiles
    );
    sendSuccess(res, sp, 'Signal Provider profile submitted for approval.', StatusCodes.CREATED);
  };

  getSignalProviders = async (req: Request, res: Response): Promise<void> => {
    const result = await signalProviderService.getSignalProviders(req.query);
    sendPaginated(res, result.signalProviders, result.total, result.page, result.limit, 'Signal providers retrieved');
  };

  getSignalProviderBySlug = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { slug } = req.params;
    const sp = await signalProviderService.getSignalProviderBySlug(slug as string, req.user?.userId);
    sendSuccess(res, sp, 'Signal Provider details retrieved', StatusCodes.OK);
  };

  updateSignalProvider = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const photoFile = req.file;
    const sp = await signalProviderService.updateSignalProvider(req.user!.userId, req.body, photoFile);
    sendSuccess(res, sp, 'Profile updated successfully', StatusCodes.OK);
  };

  createSignal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const signal = await signalProviderService.createSignal(req.user!.userId, req.body);
    sendSuccess(res, signal, 'Trading signal published successfully', StatusCodes.CREATED);
  };

  updateSignal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const signal = await signalProviderService.updateSignal(id as string, req.user!.userId, req.body);
    sendSuccess(res, signal, 'Signal updated successfully', StatusCodes.OK);
  };

  deleteSignal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await signalProviderService.deleteSignal(id as string, req.user!.userId);
    sendSuccess(res, null, result.message, StatusCodes.OK);
  };

  getSignals = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await signalProviderService.getSignals(id as string, req.query);
    sendPaginated(res, result.signals, result.total, result.page, result.limit, 'Signals retrieved');
  };

  addReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const review = await signalProviderService.addReview(id as string, req.user!.userId, req.body);
    sendSuccess(res, review, 'Review submitted successfully. Pending moderation.', StatusCodes.CREATED);
  };

  getReviews = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await signalProviderService.getReviews(id as string, req.query);
    sendPaginated(res, result.reviews, result.total, result.page, result.limit, 'Reviews retrieved');
  };

  sendEnquiry = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const enquiry = await signalProviderService.sendEnquiry(id as string, req.body, req.user?.userId);
    sendSuccess(res, enquiry, 'Enquiry sent successfully', StatusCodes.CREATED);
  };

  getMySPProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const profile = await signalProviderService.getMySPProfile(req.user!.userId);
    sendSuccess(res, profile, 'Signal Provider dashboard retrieved', StatusCodes.OK);
  };

  getMySignals = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await signalProviderService.getMySignals(req.user!.userId, req.query);
    sendPaginated(res, result.signals, result.total, result.page, result.limit, 'Signals retrieved');
  };

  uploadDocuments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const files = req.files as Express.Multer.File[];
    await signalProviderService.uploadDocuments(req.user!.userId, files);
    sendSuccess(res, null, 'Documents uploaded successfully', StatusCodes.OK);
  };
}

export const signalProviderController = new SignalProviderController();
