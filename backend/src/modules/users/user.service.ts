import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import cloudinary from '../../config/cloudinary';
import { verifyImageMagicBytes } from '../../middleware/upload.middleware';
import { normalizeToE164 } from '../../utils/phone.utils';
import { logger } from '../../utils/logger';

export class UserService {
  private sanitize(user: any) {
    if (!user) return null;
    const { password, emailVerifyToken, resetToken, twoFactorSecret, ...safeUser } = user;
    return safeUser;
  }

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
        whatsapp: true,
        city: true,
        country: true,
        bio: true,
        socialLinks: true,
        consentAt: true,
        consentVersion: true,
        isEmailVerified: true,
        createdAt: true,
        broker: {
          select: {
            id: true,
            companyName: true,
            status: true,
            onboardingStatus: true,
            slug: true,
            logo: true,
          },
        },
        accountManager: { select: { id: true, fullName: true, status: true, slug: true } },
        signalProvider: { select: { id: true, displayName: true, status: true, slug: true } },
        tutor: { select: { id: true, status: true, slug: true } },
      },
    });

    if (!user) throw new AppError('User not found.', StatusCodes.NOT_FOUND);
    return user;
  }

  async updateProfile(
    userId: string,
    data: {
      name?: string;
      phone?: string | null;
      whatsapp?: string | null;
      city?: string | null;
      country?: string | null;
      bio?: string | null;
      socialLinks?: Record<string, string> | null;
    }
  ) {
    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) throw new AppError('User not found.', StatusCodes.NOT_FOUND);

    const normalizedPhone = data.phone !== undefined ? (data.phone ? normalizeToE164(data.phone) || data.phone : null) : undefined;
    const normalizedWhatsapp = data.whatsapp !== undefined ? (data.whatsapp ? normalizeToE164(data.whatsapp) || data.whatsapp : null) : undefined;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(normalizedPhone !== undefined && { phone: normalizedPhone }),
        ...(normalizedWhatsapp !== undefined && { whatsapp: normalizedWhatsapp }),
        ...(data.city !== undefined && { city: data.city ? data.city.trim() : null }),
        ...(data.country !== undefined && { country: data.country ? data.country.trim() : null }),
        ...(data.bio !== undefined && { bio: data.bio ? data.bio.trim() : null }),
        ...(data.socialLinks !== undefined && { socialLinks: data.socialLinks || {} }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        phone: true,
        whatsapp: true,
        city: true,
        country: true,
        bio: true,
        socialLinks: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    return updated;
  }

  async uploadAvatar(userId: string, file?: Express.Multer.File) {
    if (!file || !file.buffer) {
      throw new AppError('Please provide an image file for avatar upload.', StatusCodes.BAD_REQUEST);
    }

    // Magic-byte check (defense in depth beyond mimetype)
    const isMagicValid = verifyImageMagicBytes(file.buffer);
    if (!isMagicValid) {
      throw new AppError(
        'Invalid image content. File header does not match valid JPEG, PNG, or WebP image formats.',
        StatusCodes.BAD_REQUEST
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found.', StatusCodes.NOT_FOUND);

    // Delete existing Cloudinary avatar if present
    if (user.avatar && user.avatar.includes('cloudinary.com')) {
      try {
        const parts = user.avatar.split('/');
        const fileWithExt = parts[parts.length - 1];
        const publicId = `edutradefx/avatars/${fileWithExt.split('.')[0]}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        logger.warn('Failed to delete old avatar asset from Cloudinary:', err);
      }
    }

    // Upload buffer to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'edutradefx/avatars',
          resource_type: 'image',
          transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(file.buffer);
    });

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { avatar: uploadResult.secure_url },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        phone: true,
        whatsapp: true,
        city: true,
        country: true,
        bio: true,
        socialLinks: true,
        isEmailVerified: true,
      },
    });

    return updated;
  }

  async removeAvatar(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found.', StatusCodes.NOT_FOUND);

    if (user.avatar && user.avatar.includes('cloudinary.com')) {
      try {
        const parts = user.avatar.split('/');
        const fileWithExt = parts[parts.length - 1];
        const publicId = `edutradefx/avatars/${fileWithExt.split('.')[0]}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        logger.warn('Failed to delete avatar from Cloudinary:', err);
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { avatar: null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        phone: true,
        whatsapp: true,
        city: true,
        country: true,
        bio: true,
        socialLinks: true,
      },
    });

    return updated;
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
