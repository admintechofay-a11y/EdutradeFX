import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { signalProviderService } from './sp.service';
import { sendSuccess, sendPaginated } from '../../utils/response.utils';
import { AuthenticatedRequest } from '../../types';
import { AppError } from '../../middleware/error.middleware';

export class SignalProviderController {
  // ── ONBOARDING & SECTION MANAGEMENT ───────────────────

  getMySPProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const profile = await signalProviderService.getMySPProfile(req.user!.userId);
    sendSuccess(res, profile, 'Signal Provider profile retrieved', StatusCodes.OK);
  };

  saveSection = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { section } = req.params;
    const result = await signalProviderService.saveSection(req.user!.userId, section as string, req.body);
    sendSuccess(res, result, `Section '${section}' saved successfully`, StatusCodes.OK);
  };

  uploadPhoto = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.file) {
      throw new AppError('No photo file provided.', StatusCodes.BAD_REQUEST);
    }
    const result = await signalProviderService.uploadPhoto(req.user!.userId, req.file);
    sendSuccess(res, result, 'Photo uploaded successfully', StatusCodes.OK);
  };

  uploadDocuments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const files = (req.files as Express.Multer.File[]) || (req.file ? [req.file] : []);
    const docType = req.body.docType || 'IDENTITY_DOCUMENT';
    const metadata = {
      periodFrom: req.body.periodFrom,
      periodTo: req.body.periodTo,
    };
    const docs = await signalProviderService.uploadDocuments(req.user!.userId, files, docType, metadata);
    sendSuccess(res, docs, 'Documents uploaded successfully', StatusCodes.CREATED);
  };

  deleteDocument = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    await signalProviderService.deleteDocument(req.user!.userId, id as string);
    sendSuccess(res, null, 'Document deleted successfully', StatusCodes.OK);
  };

  getAgreements = async (req: Request, res: Response): Promise<void> => {
    const agreements = await signalProviderService.getAgreements();
    sendSuccess(res, agreements, 'Agreements retrieved', StatusCodes.OK);
  };

  acceptAgreements = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const result = await signalProviderService.acceptAgreements(req.user!.userId, req.body, ip, userAgent);
    sendSuccess(res, result, 'Agreements recorded successfully', StatusCodes.OK);
  };

  submitOnboarding = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await signalProviderService.submitOnboarding(req.user!.userId);
    sendSuccess(res, result, 'Application submitted for review', StatusCodes.OK);
  };

  // ── PRICING PLANS ────────────────────────────────────

  getPlans = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const plans = await signalProviderService.getPlans(req.user!.userId);
    sendSuccess(res, plans, 'Plans retrieved', StatusCodes.OK);
  };

  savePlans = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const plansList = Array.isArray(req.body) ? req.body : req.body.plans || [];
    const plans = await signalProviderService.savePlans(req.user!.userId, plansList);
    sendSuccess(res, plans, 'Plans updated successfully', StatusCodes.OK);
  };

  // ── ENQUIRIES (S2 FIX) ───────────────────────────────

  getMyEnquiries = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await signalProviderService.getMyEnquiries(req.user!.userId, req.query);
    sendPaginated(res, result.enquiries, result.total, result.page, result.limit, 'Enquiries retrieved');
  };

  markEnquiryAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const enquiry = await signalProviderService.markEnquiryAsRead(req.user!.userId, id as string);
    sendSuccess(res, enquiry, 'Enquiry marked as read', StatusCodes.OK);
  };

  sendEnquiry = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const enquiry = await signalProviderService.sendEnquiry(id as string, req.body, req.user?.userId);
    sendSuccess(res, enquiry, 'Enquiry sent successfully', StatusCodes.CREATED);
  };

  // ── PUBLIC BROWSING ──────────────────────────────────

  getSignalProviders = async (req: Request, res: Response): Promise<void> => {
    const result = await signalProviderService.getSignalProviders(req.query);
    sendPaginated(res, result.signalProviders, result.total, result.page, result.limit, 'Signal providers retrieved');
  };

  getSignalProviderBySlug = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { slug } = req.params;
    const sp = await signalProviderService.getSignalProviderBySlug(slug as string, req.user?.userId);
    sendSuccess(res, sp, 'Signal Provider details retrieved', StatusCodes.OK);
  };

  // ── SIGNALS ──────────────────────────────────────────

  createSignal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const signal = await signalProviderService.createSignal(req.user!.userId, req.body);
    sendSuccess(res, signal, 'Trading signal published successfully', StatusCodes.CREATED);
  };

  updateSignal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const signal = await signalProviderService.updateSignal(id as string, req.user!.userId, req.body);
    sendSuccess(res, signal, 'Signal updated successfully', StatusCodes.OK);
  };

  closeSignal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const signal = await signalProviderService.updateSignal(id as string, req.user!.userId, {
      ...req.body,
      status: 'CLOSED',
    });
    sendSuccess(res, signal, 'Signal closed successfully', StatusCodes.OK);
  };

  deleteSignal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    await signalProviderService.deleteSignal(id as string, req.user!.userId);
    sendSuccess(res, null, 'Signal deleted successfully', StatusCodes.OK);
  };

  getSignals = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await signalProviderService.getSignals(id as string, req.query);
    sendPaginated(res, result.signals, result.total, result.page, result.limit, 'Signals retrieved');
  };

  getMySignals = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await signalProviderService.getMySignals(req.user!.userId, req.query);
    sendPaginated(res, result.signals, result.total, result.page, result.limit, 'Signals retrieved');
  };

  // ── REVIEWS ──────────────────────────────────────────

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

  // ── LEGACY DEPRECATED WRAPPERS ────────────────────────

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

  updateSignalProvider = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const photoFile = req.file;
    const sp = await signalProviderService.updateSignalProvider(req.user!.userId, req.body, photoFile);
    sendSuccess(res, sp, 'Profile updated successfully', StatusCodes.OK);
  };
}

export const signalProviderController = new SignalProviderController();
