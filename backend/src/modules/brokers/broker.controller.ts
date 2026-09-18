import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { brokerService } from './broker.service';
import { sendSuccess, sendPaginated } from '../../utils/response.utils';
import { AuthenticatedRequest } from '../../types';

export class BrokerController {
  registerBroker = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const logoFile = files?.['logo']?.[0];
    const docFiles = files?.['documents'];

    const broker = await brokerService.registerBroker(
      req.user!.userId,
      req.body,
      logoFile,
      docFiles
    );
    sendSuccess(res, broker, 'Broker registration submitted for approval.', StatusCodes.CREATED);
  };

  getBrokers = async (req: Request, res: Response): Promise<void> => {
    const result = await brokerService.getBrokers(req.query);
    sendPaginated(res, result.brokers, result.total, result.page, result.limit, 'Brokers retrieved');
  };

  getBrokerBySlug = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { slug } = req.params;
    const broker = await brokerService.getBrokerBySlug(slug as string, req.user?.userId);
    sendSuccess(res, broker, 'Broker details retrieved', StatusCodes.OK);
  };

  updateBroker = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const logoFile = req.file;
    const broker = await brokerService.updateBroker(req.user!.userId, req.body, logoFile);
    sendSuccess(res, broker, 'Broker profile updated successfully', StatusCodes.OK);
  };

  uploadDocuments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const files = req.files as Express.Multer.File[];
    await brokerService.uploadDocuments(req.user!.userId, files);
    sendSuccess(res, null, 'Documents uploaded successfully', StatusCodes.OK);
  };

  compareBrokers = async (req: Request, res: Response): Promise<void> => {
    const ids = Array.isArray(req.query.brokerIds)
      ? (req.query.brokerIds as string[])
      : typeof req.query.brokerIds === 'string'
      ? req.query.brokerIds.split(',')
      : [];
    const comparison = await brokerService.compareBrokers(ids);
    sendSuccess(res, comparison, 'Broker comparison data retrieved', StatusCodes.OK);
  };

  addReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const review = await brokerService.addReview(id as string, req.user!.userId, req.body);
    sendSuccess(res, review, 'Review submitted successfully. Pending admin review.', StatusCodes.CREATED);
  };

  getReviews = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await brokerService.getReviews(id as string, req.query);
    sendPaginated(res, result.reviews, result.total, result.page, result.limit, 'Reviews retrieved');
  };

  respondToReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { reviewId } = req.params;
    const { response } = req.body;
    const updatedReview = await brokerService.respondToReview(reviewId as string, req.user!.userId, response);
    sendSuccess(res, updatedReview, 'Response posted to review', StatusCodes.OK);
  };

  saveBroker = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await brokerService.toggleSaveBroker(req.user!.userId, id as string);
    sendSuccess(res, result, result.saved ? 'Broker added to watchlist' : 'Broker removed from watchlist', StatusCodes.OK);
  };

  submitLead = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const lead = await brokerService.submitLead(id as string, req.body);
    sendSuccess(res, lead, 'Inquiry sent to broker successfully', StatusCodes.CREATED);
  };

  getMyBrokerProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const profile = await brokerService.getMyBrokerProfile(req.user!.userId);
    sendSuccess(res, profile, 'Broker dashboard data retrieved', StatusCodes.OK);
  };

  getMyLeads = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await brokerService.getMyLeads(req.user!.userId, req.query);
    sendPaginated(res, result.leads, result.total, result.page, result.limit, 'Broker leads retrieved');
  };
}

export const brokerController = new BrokerController();
