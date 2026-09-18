import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { advertisementService } from './ad.service';
import { sendSuccess, sendPaginated } from '../../utils/response.utils';
import { AdPlacement } from '@prisma/client';

export class AdvertisementController {
  getActiveAds = async (req: Request, res: Response): Promise<void> => {
    const { placement } = req.query;
    const ads = await advertisementService.getActiveAds(placement as AdPlacement);
    sendSuccess(res, ads, 'Active advertisements retrieved', StatusCodes.OK);
  };

  trackImpression = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await advertisementService.trackImpression(id as string);
    sendSuccess(res, null, 'Impression recorded', StatusCodes.OK);
  };

  trackClick = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await advertisementService.trackClick(id as string);
    sendSuccess(res, null, 'Click recorded', StatusCodes.OK);
  };

  createAd = async (req: Request, res: Response): Promise<void> => {
    const ad = await advertisementService.createAd(req.body, req.file);
    sendSuccess(res, ad, 'Advertisement created successfully', StatusCodes.CREATED);
  };

  updateAd = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const ad = await advertisementService.updateAd(id as string, req.body, req.file);
    sendSuccess(res, ad, 'Advertisement updated', StatusCodes.OK);
  };

  deleteAd = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await advertisementService.deleteAd(id as string);
    sendSuccess(res, null, result.message, StatusCodes.OK);
  };

  getAdsAdmin = async (req: Request, res: Response): Promise<void> => {
    const result = await advertisementService.getAdsAdmin(req.query);
    sendPaginated(res, result.ads, result.total, result.page, result.limit, 'All advertisements retrieved');
  };
}

export const advertisementController = new AdvertisementController();
