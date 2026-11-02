import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import { providerAdminService } from './provider.admin.service';
import { sendSuccess } from '../../utils/response.utils';

export class ProviderAdminController {
  listProviders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const data = await providerAdminService.listProviders(req.query);
    sendSuccess(res, data, 'Providers retrieved successfully');
  };

  getProviderDetails = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const data = await providerAdminService.getProviderDetails(String(req.params.id));
    sendSuccess(res, data, 'Provider details retrieved successfully');
  };

  updateStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const data = await providerAdminService.updateStatus(
      String(req.params.id),
      req.body.status,
      req.body.note,
      req.user!.userId
    );
    sendSuccess(res, data, `Provider status updated to ${req.body.status}`);
  };

  updateCategoryStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const data = await providerAdminService.updateCategoryStatus(
      String(req.params.selectionId),
      req.body.status,
      req.body.note,
      req.user!.userId
    );
    sendSuccess(res, data, `Category status updated to ${req.body.status}`);
  };

  updateProductStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const data = await providerAdminService.updateProductStatus(
      String(req.params.productId),
      req.body.status,
      req.body.note,
      req.user!.userId
    );
    sendSuccess(res, data, `Product status updated to ${req.body.status}`);
  };

  toggleClaimVerification = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const data = await providerAdminService.toggleClaimVerification(
      req.body.targetType,
      String(req.params.targetId),
      req.body.claimKey,
      req.body.verified,
      req.user!.userId
    );
    sendSuccess(res, data, 'Claim verification updated');
  };

  toggleVerifiedBadge = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const data = await providerAdminService.toggleVerifiedBadge(
      String(req.params.id),
      req.body.verified,
      req.body.note,
      req.user!.userId
    );
    sendSuccess(res, data, 'Verified badge updated');
  };

  moderateReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const data = await providerAdminService.moderateReview(
      String(req.params.reviewId),
      req.body.status,
      req.body.note,
      req.user!.userId
    );
    sendSuccess(res, data, `Review status updated to ${req.body.status}`);
  };
}

export const providerAdminController = new ProviderAdminController();

