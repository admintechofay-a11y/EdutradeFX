import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { generateUniqueSlug } from '../../utils/slug.utils';
import { parsePagination } from '../../utils/pagination.utils';
import { ApprovalStatus, EnquiryTargetType, NotificationType, Prisma } from '@prisma/client';
import { transporter } from '../../config/email';

export class AccountManagerService {
  async registerAccountManager(userId: string, data: any, photoFile?: Express.Multer.File, docFiles?: Express.Multer.File[]) {
    const existing = await prisma.accountManager.findUnique({ where: { userId } });
    if (existing) {
      throw new AppError('An account manager profile is already associated with this account.', StatusCodes.CONFLICT);
    }

    const slug = await generateUniqueSlug(data.fullName, 'accountManager');
    const photoUrl = photoFile ? (photoFile as any).path || (photoFile as any).secure_url : undefined;

    const am = await prisma.accountManager.create({
      data: {
        userId,
        fullName: data.fullName,
        slug,
        photo: photoUrl,
        tagline: data.tagline,
        bio: data.bio,
        expertise: Array.isArray(data.expertise) ? data.expertise : [data.expertise],
        languages: Array.isArray(data.languages) ? data.languages : [data.languages],
        country: data.country,
        city: data.city,
        yearsExperience: data.yearsExperience ? parseInt(data.yearsExperience, 10) : undefined,
        services: Array.isArray(data.services) ? data.services : [data.services],
        availability: data.availability,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        status: ApprovalStatus.PENDING,
      },
    });

    if (docFiles && docFiles.length > 0) {
      await prisma.accountManagerDocument.createMany({
        data: docFiles.map((f) => ({
          accountManagerId: am.id,
          fileUrl: (f as any).path || (f as any).secure_url || f.filename,
          fileName: f.originalname,
          docType: 'PROFESSIONAL_CERTIFICATION',
        })),
      });
    }

    // Notify Admins
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: NotificationType.APPROVAL,
          title: 'New Account Manager Application',
          message: `${data.fullName} registered for Account Manager verification.`,
          link: `/admin/account-managers/${am.id}`,
        })),
      });
    }

    return am;
  }

  async getAccountManagers(query: any) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.AccountManagerWhereInput = {
      status: ApprovalStatus.APPROVED,
    };

    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search as string, mode: 'insensitive' } },
        { bio: { contains: query.search as string, mode: 'insensitive' } },
        { tagline: { contains: query.search as string, mode: 'insensitive' } },
      ];
    }

    if (query.expertise) {
      where.expertise = { has: query.expertise as string };
    }

    if (query.country) {
      where.country = { equals: query.country as string, mode: 'insensitive' };
    }

    if (query.language) {
      where.languages = { has: query.language as string };
    }

    if (query.isFeatured !== undefined) {
      where.isFeatured = query.isFeatured === 'true';
    }

    let orderBy: Prisma.AccountManagerOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sortBy === 'avgRating') {
      orderBy = { avgRating: query.sortOrder === 'asc' ? 'asc' : 'desc' };
    } else if (query.sortBy === 'totalReviews') {
      orderBy = { totalReviews: query.sortOrder === 'asc' ? 'asc' : 'desc' };
    } else if (query.sortBy === 'yearsExperience') {
      orderBy = { yearsExperience: query.sortOrder === 'asc' ? 'asc' : 'desc' };
    }

    const [accountManagers, total] = await Promise.all([
      prisma.accountManager.findMany({
        where,
        skip,
        take,
        orderBy,
      }),
      prisma.accountManager.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { accountManagers, total, page, limit, totalPages };
  }

  async getAccountManagerBySlug(slug: string, currentUserId?: string) {
    const am = await prisma.accountManager.findUnique({
      where: { slug },
      include: {
        documents: true,
        reviews: {
          where: { isApproved: true },
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!am) {
      throw new AppError('Account Manager not found.', StatusCodes.NOT_FOUND);
    }

    if (am.status !== ApprovalStatus.APPROVED && am.userId !== currentUserId) {
      const viewer = currentUserId ? await prisma.user.findUnique({ where: { id: currentUserId } }) : null;
      if (!viewer || viewer.role !== 'ADMIN') {
        throw new AppError('Profile is currently unavailable.', StatusCodes.NOT_FOUND);
      }
    }

    return am;
  }

  async updateAccountManager(userId: string, data: any, photoFile?: Express.Multer.File) {
    const am = await prisma.accountManager.findUnique({ where: { userId } });
    if (!am) {
      throw new AppError('Account Manager profile not found.', StatusCodes.NOT_FOUND);
    }

    const photoUrl = photoFile ? (photoFile as any).path || (photoFile as any).secure_url : am.photo;

    return await prisma.accountManager.update({
      where: { id: am.id },
      data: {
        ...(photoUrl && { photo: photoUrl }),
        ...(data.fullName && { fullName: data.fullName }),
        ...(data.tagline !== undefined && { tagline: data.tagline }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.expertise && { expertise: Array.isArray(data.expertise) ? data.expertise : [data.expertise] }),
        ...(data.languages && { languages: Array.isArray(data.languages) ? data.languages : [data.languages] }),
        ...(data.country && { country: data.country }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.yearsExperience !== undefined && { yearsExperience: parseInt(data.yearsExperience, 10) }),
        ...(data.services && { services: Array.isArray(data.services) ? data.services : [data.services] }),
        ...(data.availability !== undefined && { availability: data.availability }),
        ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle }),
        ...(data.seoDescription !== undefined && { seoDescription: data.seoDescription }),
      },
    });
  }

  async uploadDocuments(userId: string, files: Express.Multer.File[]) {
    const am = await prisma.accountManager.findUnique({ where: { userId } });
    if (!am) {
      throw new AppError('Account Manager profile not found.', StatusCodes.NOT_FOUND);
    }

    return await prisma.accountManagerDocument.createMany({
      data: files.map((f) => ({
        accountManagerId: am.id,
        fileUrl: (f as any).path || (f as any).secure_url || f.filename,
        fileName: f.originalname,
        docType: 'CREDENTIAL_DOCUMENT',
      })),
    });
  }

  async addReview(amId: string, userId: string, data: { rating: number; comment: string }) {
    const am = await prisma.accountManager.findUnique({ where: { id: amId } });
    if (!am) {
      throw new AppError('Account Manager not found.', StatusCodes.NOT_FOUND);
    }

    if (am.userId === userId) {
      throw new AppError('You cannot review yourself.', StatusCodes.FORBIDDEN);
    }

    const existingReview = await prisma.accountManagerReview.findFirst({
      where: { accountManagerId: amId, userId },
    });

    if (existingReview) {
      throw new AppError('You have already submitted a review for this account manager.', StatusCodes.CONFLICT);
    }

    const review = await prisma.accountManagerReview.create({
      data: {
        accountManagerId: amId,
        userId,
        rating: data.rating,
        comment: data.comment,
        isApproved: false,
      },
    });

    await prisma.notification.create({
      data: {
        userId: am.userId,
        type: NotificationType.REVIEW,
        title: 'New Client Review Received',
        message: `A client left a ${data.rating}-star review on your profile.`,
        link: `/dashboard/reviews`,
      },
    });

    return review;
  }

  async getReviews(amId: string, query: any) {
    const { skip, take, page, limit } = parsePagination(query);

    const [reviews, total] = await Promise.all([
      prisma.accountManagerReview.findMany({
        where: { accountManagerId: amId, isApproved: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      }),
      prisma.accountManagerReview.count({ where: { accountManagerId: amId, isApproved: true } }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { reviews, total, page, limit, totalPages };
  }

  async sendEnquiry(amId: string, data: { name: string; email: string; phone?: string; message: string }, currentUserId?: string) {
    const am = await prisma.accountManager.findUnique({
      where: { id: amId },
      include: { user: true },
    });

    if (!am || am.status !== ApprovalStatus.APPROVED) {
      throw new AppError('Account Manager not available for inquiries.', StatusCodes.NOT_FOUND);
    }

    const enquiry = await prisma.enquiry.create({
      data: {
        userId: currentUserId,
        accountManagerId: am.id,
        targetType: EnquiryTargetType.ACCOUNT_MANAGER,
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
      },
    });

    await prisma.notification.create({
      data: {
        userId: am.userId,
        type: NotificationType.ENQUIRY,
        title: 'New Client Inquiry',
        message: `You received an inquiry from ${data.name} (${data.email}).`,
        link: `/dashboard/enquiries`,
      },
    });

    transporter
      .sendMail({
        to: am.user.email,
        subject: `New Client Inquiry for Account Management: ${data.name}`,
        text: `You have received a new consultation request from ${data.name} (${data.email}, Phone: ${data.phone || 'N/A'}):\n\n${data.message}`,
      })
      .catch(() => {});

    return enquiry;
  }

  async getMyAMProfile(userId: string) {
    const am = await prisma.accountManager.findUnique({
      where: { userId },
      include: {
        documents: true,
        enquiries: { orderBy: { createdAt: 'desc' }, take: 5 },
        reviews: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    if (!am) {
      throw new AppError('Account Manager profile not found.', StatusCodes.NOT_FOUND);
    }

    return am;
  }

  async getMyEnquiries(userId: string, query: any) {
    const am = await prisma.accountManager.findUnique({ where: { userId } });
    if (!am) {
      throw new AppError('Account Manager profile not found.', StatusCodes.NOT_FOUND);
    }

    const { skip, take, page, limit } = parsePagination(query);
    const [enquiries, total] = await Promise.all([
      prisma.enquiry.findMany({
        where: { accountManagerId: am.id },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.enquiry.count({ where: { accountManagerId: am.id } }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { enquiries, total, page, limit, totalPages };
  }
}

export const accountManagerService = new AccountManagerService();
