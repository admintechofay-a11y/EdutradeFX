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
    const profile = await userService.updateProfile(req.user!.userId, req.body);
    sendSuccess(res, profile, 'Profile updated successfully', StatusCodes.OK);
  };

  uploadAvatar = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const updated = await userService.uploadAvatar(req.user!.userId, req.file);
    sendSuccess(res, updated, 'Avatar updated successfully', StatusCodes.OK);
  };

  removeAvatar = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const updated = await userService.removeAvatar(req.user!.userId);
    sendSuccess(res, updated, 'Avatar removed successfully', StatusCodes.OK);
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
