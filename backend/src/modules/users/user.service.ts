import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';

export class UserService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        phone: true,
        isEmailVerified: true,
        createdAt: true,
        broker: { select: { id: true, companyName: true, status: true, slug: true } },
        accountManager: { select: { id: true, fullName: true, status: true, slug: true } },
        signalProvider: { select: { id: true, displayName: true, status: true, slug: true } },
        tutor: { select: { id: true, status: true, slug: true } },
      },
    });

    if (!user) throw new AppError('User not found.', StatusCodes.NOT_FOUND);
    return user;
  }

  async updateProfile(userId: string, data: { name?: string; phone?: string }, file?: Express.Multer.File) {
    const avatarUrl = file ? (file as any).path || (file as any).secure_url : undefined;

    return await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(avatarUrl && { avatar: avatarUrl }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        phone: true,
        isEmailVerified: true,
      },
    });
  }

  async getSavedBrokers(userId: string) {
    const saved = await prisma.savedBroker.findMany({
      where: { userId },
      include: {
        broker: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return saved.map((s) => s.broker);
  }

  async getOrders(userId: string) {
    return await prisma.order.findMany({
      where: { userId },
      include: {
        course: { select: { id: true, title: true, slug: true, thumbnail: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const userService = new UserService();
