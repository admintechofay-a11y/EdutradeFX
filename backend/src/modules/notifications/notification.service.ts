import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { parsePagination } from '../../utils/pagination.utils';
import { NotificationType } from '@prisma/client';

export class NotificationService {
  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    link?: string
  ) {
    return await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
      },
    });
  }

  async getMyNotifications(userId: string, query: any) {
    const { skip, take, page, limit } = parsePagination(query);

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where: { userId } }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { notifications, total, page, limit, totalPages };
  }

  async getUnreadCount(userId: string) {
    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { unreadCount: count };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
    if (!notification || notification.userId !== userId) {
      throw new AppError('Notification not found.', StatusCodes.NOT_FOUND);
    }

    return await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { message: 'All notifications marked as read.' };
  }

  async deleteNotification(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
    if (!notification || notification.userId !== userId) {
      throw new AppError('Notification not found.', StatusCodes.NOT_FOUND);
    }

    await prisma.notification.delete({ where: { id: notificationId } });
    return { message: 'Notification deleted successfully.' };
  }
}

export const notificationService = new NotificationService();
