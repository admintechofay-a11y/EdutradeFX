import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { providerPublicService } from './provider.public.service';
import { sendSuccess } from '../../utils/response.utils';
import { AuthenticatedRequest } from '../../types';

export class ProviderPublicController {
  getDirectory = async (req: Request, res: Response): Promise<void> => {
    const data = await providerPublicService.getDirectory({
      category: req.query.category ? Number(req.query.category) : undefined,
      platform: req.query.platform ? String(req.query.platform) : undefined,
      country: req.query.country ? String(req.query.country) : undefined,
      verifiedOnly: req.query.verifiedOnly === 'true',
      search: req.query.search ? String(req.query.search) : undefined,
      pricingModel: req.query.pricingModel ? String(req.query.pricingModel) : undefined,
      sortBy: req.query.sortBy as any,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 12,
    });
    sendSuccess(res, data, 'Solutions providers retrieved successfully');
  };

  getCategories = async (req: Request, res: Response): Promise<void> => {
    const data = await providerPublicService.getCategoriesWithCounts();
    sendSuccess(res, data, 'Categories retrieved successfully');
  };

  getProviderBySlug = async (req: Request, res: Response): Promise<void> => {
    const data = await providerPublicService.getProviderBySlug(String(req.params.slug));
    sendSuccess(res, data, 'Provider profile retrieved successfully');
  };

  getProductBySlug = async (req: Request, res: Response): Promise<void> => {
    const data = await providerPublicService.getProductBySlug(
      String(req.params.providerSlug),
      String(req.params.productSlug)
    );
    sendSuccess(res, data, 'Product details retrieved successfully');
  };

  getProviderPreview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const isAdmin = req.user?.role === 'ADMIN';
    const data = await providerPublicService.getProviderPreview(
      String(req.params.slug),
      req.user!.userId,
      isAdmin
    );
    sendSuccess(res, data, 'Provider draft preview retrieved successfully');
  };

  submitEnquiry = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const enquiry = await providerPublicService.submitEnquiry(
      String(req.params.id),
      req.body,
      req.user?.userId
    );
    sendSuccess(res, enquiry, 'Enquiry submitted successfully', StatusCodes.CREATED);
  };

  submitReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const review = await providerPublicService.submitReview(
      String(req.params.id),
      req.user!.userId,
      req.body
    );
    sendSuccess(res, review, 'Review submitted successfully and is pending moderation', StatusCodes.CREATED);
  };
}

export const providerPublicController = new ProviderPublicController();
