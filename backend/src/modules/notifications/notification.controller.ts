import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { notificationService } from './notification.service';
import { sendSuccess, sendPaginated } from '../../utils/response.utils';
import { AuthenticatedRequest } from '../../types';

export class NotificationController {
  getMyNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await notificationService.getMyNotifications(req.user!.userId, req.query);
    sendPaginated(res, result.notifications, result.total, result.page, result.limit, 'Notifications retrieved');
  };

  getUnreadCount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await notificationService.getUnreadCount(req.user!.userId);
    sendSuccess(res, result, 'Unread count retrieved', StatusCodes.OK);
  };

  markAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const notification = await notificationService.markAsRead(id as string, req.user!.userId);
    sendSuccess(res, notification, 'Notification marked as read', StatusCodes.OK);
  };

  markAllAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await notificationService.markAllAsRead(req.user!.userId);
    sendSuccess(res, null, result.message, StatusCodes.OK);
  };

  deleteNotification = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await notificationService.deleteNotification(id as string, req.user!.userId);
    sendSuccess(res, null, result.message, StatusCodes.OK);
  };
}

export const notificationController = new NotificationController();
