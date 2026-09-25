import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { parsePagination } from '../../utils/pagination.utils';
import { AdPlacement, Prisma } from '@prisma/client';

export class AdvertisementService {
  async createAd(data: any, file?: Express.Multer.File) {
    const imageUrl = file ? (file as any).path || (file as any).secure_url : data.imageUrl;
    if (!imageUrl) {
      throw new AppError('Banner creative image is required.', StatusCodes.BAD_REQUEST);
    }

    return await prisma.advertisement.create({
      data: {
        title: data.title,
        imageUrl,
        linkUrl: data.linkUrl,
        placement: data.placement as AdPlacement,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: data.isActive !== undefined ? data.isActive === 'true' || data.isActive === true : true,
        brokerId: data.brokerId || null,
        courseId: data.courseId || null,
      },
    });
  }

  async getActiveAds(placement?: AdPlacement) {
    const now = new Date();
    const where: Prisma.AdvertisementWhereInput = {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    };

    if (placement) {
      where.placement = placement;
    }

    return await prisma.advertisement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async trackImpression(adId: string) {
    const ad = await prisma.advertisement.findUnique({ where: { id: adId } });
    if (!ad || !ad.isActive) {
      throw new AppError('Advertisement not found or inactive.', StatusCodes.NOT_FOUND);
    }

    return await prisma.advertisement.update({
      where: { id: adId },
      data: { impressions: { increment: 1 } },
    });
  }

  async trackClick(adId: string) {
    const ad = await prisma.advertisement.findUnique({ where: { id: adId } });
    if (!ad || !ad.isActive) {
      throw new AppError('Advertisement not found or inactive.', StatusCodes.NOT_FOUND);
    }

    return await prisma.advertisement.update({
      where: { id: adId },
      data: { clicks: { increment: 1 } },
    });
  }

  async updateAd(id: string, data: any, file?: Express.Multer.File) {
    const ad = await prisma.advertisement.findUnique({ where: { id } });
    if (!ad) {
      throw new AppError('Advertisement not found.', StatusCodes.NOT_FOUND);
    }

    const imageUrl = file ? (file as any).path || (file as any).secure_url : ad.imageUrl;

    return await prisma.advertisement.update({
      where: { id },
      data: {
        ...(imageUrl && { imageUrl }),
        ...(data.title && { title: data.title }),
        ...(data.linkUrl && { linkUrl: data.linkUrl }),
        ...(data.placement && { placement: data.placement }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.brokerId !== undefined && { brokerId: data.brokerId || null }),
        ...(data.courseId !== undefined && { courseId: data.courseId || null }),
      },
    });
  }

  async deleteAd(id: string) {
    const ad = await prisma.advertisement.findUnique({ where: { id } });
    if (!ad) {
      throw new AppError('Advertisement not found.', StatusCodes.NOT_FOUND);
    }

    await prisma.advertisement.delete({ where: { id } });
    return { message: 'Advertisement removed successfully.' };
  }

  async getAdsAdmin(query: any) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.AdvertisementWhereInput = {};
    if (query.placement) {
      where.placement = query.placement as AdPlacement;
    }
    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true';
    }

    const [ads, total] = await Promise.all([
      prisma.advertisement.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.advertisement.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { ads, total, page, limit, totalPages };
  }
}

export const advertisementService = new AdvertisementService();
