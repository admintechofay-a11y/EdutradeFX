import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { userService } from './user.service';
import { sendSuccess } from '../../utils/response.utils';
import { AuthenticatedRequest } from '../../types';

export class UserController {
  getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const profile = await userService.getProfile(req.user!.userId);
    sendSuccess(res, profile, 'User profile retrieved', StatusCodes.OK);
  };

  updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const profile = await userService.updateProfile(req.user!.userId, req.body, req.file);
    sendSuccess(res, profile, 'Profile updated successfully', StatusCodes.OK);
  };

  getSavedBrokers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const brokers = await userService.getSavedBrokers(req.user!.userId);
    sendSuccess(res, brokers, 'Saved brokers retrieved', StatusCodes.OK);
  };

  getOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const orders = await userService.getOrders(req.user!.userId);
    sendSuccess(res, orders, 'Orders retrieved', StatusCodes.OK);
  };
}

export const userController = new UserController();
