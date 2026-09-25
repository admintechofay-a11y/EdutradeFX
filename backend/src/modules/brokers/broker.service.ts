import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { generateUniqueSlug } from '../../utils/slug.utils';
import { parsePagination } from '../../utils/pagination.utils';
import { ApprovalStatus, NotificationType, Prisma, Role } from '@prisma/client';
import { transporter } from '../../config/email';

export class BrokerService {
  /**
   * Register a new broker profile
   */
  async registerBroker(userId: string, data: any, logoFile?: Express.Multer.File, documentFiles?: Express.Multer.File[]) {
    const existing = await prisma.broker.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new AppError('You have already submitted a broker registration.', StatusCodes.CONFLICT);
    }

    const slug = await generateUniqueSlug(data.companyName, 'broker');
    const logoUrl = logoFile ? (logoFile as any).path || (logoFile as any).secure_url : undefined;

    const broker = await prisma.broker.create({
      data: {
        userId,
        companyName: data.companyName,
        slug,
        logo: logoUrl,
        website: data.website,
        description: data.description,
        yearFounded: data.yearFounded ? parseInt(data.yearFounded, 10) : undefined,
        headquarters: data.headquarters,
        countries: Array.isArray(data.countries) ? data.countries : [data.countries],
        regulation: Array.isArray(data.regulation) ? data.regulation : [data.regulation],
        tradingPlatforms: Array.isArray(data.tradingPlatforms) ? data.tradingPlatforms : [data.tradingPlatforms],
        accountTypes: Array.isArray(data.accountTypes) ? data.accountTypes : [data.accountTypes],
        minDeposit: data.minDeposit ? parseFloat(data.minDeposit) : undefined,
        maxLeverage: data.maxLeverage,
        spreadsFrom: data.spreadsFrom,
        commissions: data.commissions,
        instruments: Array.isArray(data.instruments) ? data.instruments : [data.instruments],
        depositMethods: Array.isArray(data.depositMethods) ? data.depositMethods : [data.depositMethods],
        withdrawMethods: Array.isArray(data.withdrawMethods) ? data.withdrawMethods : [data.withdrawMethods],
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        status: ApprovalStatus.PENDING,
      },
    });

    // Save uploaded verification documents if present
    if (documentFiles && documentFiles.length > 0) {
      await prisma.brokerDocument.createMany({
        data: documentFiles.map((f) => ({
          brokerId: broker.id,
          fileUrl: (f as any).path || (f as any).secure_url || f.filename,
          fileName: f.originalname,
          fileType: f.mimetype,
          docType: 'REGULATORY_LICENSE',
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
          title: 'New Broker Application',
          message: `${data.companyName} has submitted registration for compliance review.`,
          link: `/admin/brokers/${broker.id}`,
        })),
      });
    }

    return broker;
  }

  /**
   * Get approved brokers with filtering, search, and pagination
   */
  async getBrokers(query: any) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.BrokerWhereInput = {
      status: ApprovalStatus.APPROVED,
    };

    if (query.search) {
      where.OR = [
        { companyName: { contains: query.search as string, mode: 'insensitive' } },
        { description: { contains: query.search as string, mode: 'insensitive' } },
      ];
    }

    if (query.country) {
      where.countries = { has: query.country as string };
    }

    if (query.regulation) {
      where.regulation = { has: query.regulation as string };
    }

    if (query.platform) {
      where.tradingPlatforms = { has: query.platform as string };
    }

    if (query.accountType) {
      where.accountTypes = { has: query.accountType as string };
    }

    if (query.instrument) {
      where.instruments = { has: query.instrument as string };
    }

    if (query.isFeatured !== undefined) {
      where.isFeatured = query.isFeatured === 'true';
    }

    if (query.minDeposit) {
      where.minDeposit = { lte: parseFloat(query.minDeposit as string) };
    }

    // Sorting
    let orderBy: Prisma.BrokerOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sortBy === 'avgRating') {
      orderBy = { avgRating: query.sortOrder === 'asc' ? 'asc' : 'desc' };
    } else if (query.sortBy === 'totalReviews') {
      orderBy = { totalReviews: query.sortOrder === 'asc' ? 'asc' : 'desc' };
    } else if (query.sortBy === 'minDeposit') {
      orderBy = { minDeposit: query.sortOrder === 'desc' ? 'desc' : 'asc' };
    }

    const [brokers, total] = await Promise.all([
      prisma.broker.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          reviews: {
            where: { isApproved: true },
            take: 3,
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      prisma.broker.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { brokers, total, page, limit, totalPages };
  }

  /**
   * Get single broker details by unique slug
   */
  async getBrokerBySlug(slug: string, currentUserId?: string) {
    const broker = await prisma.broker.findUnique({
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

    if (!broker) {
      throw new AppError('Broker profile not found.', StatusCodes.NOT_FOUND);
    }

    const isOwner = currentUserId && broker.userId === currentUserId;
    let isAdmin = false;
    if (currentUserId && !isOwner) {
      const viewer = await prisma.user.findUnique({ where: { id: currentUserId }, select: { role: true } });
      isAdmin = viewer?.role === Role.ADMIN;
    }

    // Allow owner or admins to view non-approved profile
    if (broker.status !== ApprovalStatus.APPROVED && !isOwner && !isAdmin) {
      throw new AppError('Broker profile is currently under review or unavailable.', StatusCodes.NOT_FOUND);
    }

    // Never leak private compliance documents to public visitors
    if (!isOwner && !isAdmin) {
      const { documents: _docs, ...publicBroker } = broker as any;
      return publicBroker;
    }

    return broker;
  }

  /**
   * Update broker profile
   */
  async updateBroker(userId: string, data: any, logoFile?: Express.Multer.File) {
    const broker = await prisma.broker.findUnique({ where: { userId } });
    if (!broker) {
      throw new AppError('Broker profile not found.', StatusCodes.NOT_FOUND);
    }

    const logoUrl = logoFile ? (logoFile as any).path || (logoFile as any).secure_url : broker.logo;

    // Compliance Re-Review: If sensitive regulatory/trading fields are changed, revert APPROVED to PENDING
    const hasSensitiveChanges = Boolean(
      (data.regulation && JSON.stringify(data.regulation) !== JSON.stringify(broker.regulation)) ||
      (data.maxLeverage !== undefined && data.maxLeverage !== broker.maxLeverage) ||
      (data.spreadsFrom !== undefined && data.spreadsFrom !== broker.spreadsFrom) ||
      (data.commissions !== undefined && data.commissions !== broker.commissions) ||
      (data.minDeposit !== undefined && parseFloat(data.minDeposit) !== broker.minDeposit) ||
      (data.accountTypes && JSON.stringify(data.accountTypes) !== JSON.stringify(broker.accountTypes)) ||
      (data.depositMethods && JSON.stringify(data.depositMethods) !== JSON.stringify(broker.depositMethods)) ||
      (data.withdrawMethods && JSON.stringify(data.withdrawMethods) !== JSON.stringify(broker.withdrawMethods))
    );

    const newStatus = (broker.status === ApprovalStatus.APPROVED && hasSensitiveChanges)
      ? ApprovalStatus.PENDING
      : broker.status;

    return await prisma.broker.update({
      where: { id: broker.id },
      data: {
        status: newStatus,
        ...(logoUrl && { logo: logoUrl }),
        ...(data.website !== undefined && { website: data.website }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.headquarters !== undefined && { headquarters: data.headquarters }),
        ...(data.countries && { countries: Array.isArray(data.countries) ? data.countries : [data.countries] }),
        ...(data.regulation && { regulation: Array.isArray(data.regulation) ? data.regulation : [data.regulation] }),
        ...(data.tradingPlatforms && {
          tradingPlatforms: Array.isArray(data.tradingPlatforms) ? data.tradingPlatforms : [data.tradingPlatforms],
        }),
        ...(data.accountTypes && {
          accountTypes: Array.isArray(data.accountTypes) ? data.accountTypes : [data.accountTypes],
        }),
        ...(data.minDeposit !== undefined && { minDeposit: parseFloat(data.minDeposit) }),
        ...(data.maxLeverage !== undefined && { maxLeverage: data.maxLeverage }),
        ...(data.spreadsFrom !== undefined && { spreadsFrom: data.spreadsFrom }),
        ...(data.commissions !== undefined && { commissions: data.commissions }),
        ...(data.instruments && { instruments: Array.isArray(data.instruments) ? data.instruments : [data.instruments] }),
        ...(data.depositMethods && {
          depositMethods: Array.isArray(data.depositMethods) ? data.depositMethods : [data.depositMethods],
        }),
        ...(data.withdrawMethods && {
          withdrawMethods: Array.isArray(data.withdrawMethods) ? data.withdrawMethods : [data.withdrawMethods],
        }),
        ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle }),
        ...(data.seoDescription !== undefined && { seoDescription: data.seoDescription }),
      },
    });
  }

  /**
   * Upload additional compliance documents
   */
  async uploadDocuments(userId: string, files: Express.Multer.File[]) {
    const broker = await prisma.broker.findUnique({ where: { userId } });
    if (!broker) {
      throw new AppError('Broker profile not found.', StatusCodes.NOT_FOUND);
    }

    if (!files || files.length === 0) {
      throw new AppError('No files uploaded.', StatusCodes.BAD_REQUEST);
    }

    const created = await prisma.brokerDocument.createMany({
      data: files.map((f) => ({
        brokerId: broker.id,
        fileUrl: (f as any).path || (f as any).secure_url || f.filename,
        fileName: f.originalname,
        fileType: f.mimetype,
        docType: 'REGULATORY_DOCUMENT',
      })),
    });

    // Submitting new compliance documents moves profile back to PENDING for admin review
    if (broker.status === ApprovalStatus.APPROVED) {
      await prisma.broker.update({
        where: { id: broker.id },
        data: { status: ApprovalStatus.PENDING },
      });
    }

    return created;
  }

  /**
   * Compare 2 to 4 brokers side-by-side
   */
  async compareBrokers(brokerIds: string[]) {
    const brokers = await prisma.broker.findMany({
      where: {
        id: { in: brokerIds },
        status: ApprovalStatus.APPROVED,
      },
      select: {
        id: true,
        companyName: true,
        slug: true,
        logo: true,
        website: true,
        yearFounded: true,
        headquarters: true,
        countries: true,
        regulation: true,
        tradingPlatforms: true,
        accountTypes: true,
        minDeposit: true,
        maxLeverage: true,
        spreadsFrom: true,
        commissions: true,
        instruments: true,
        depositMethods: true,
        withdrawMethods: true,
        avgRating: true,
        totalReviews: true,
      },
    });

    if (brokers.length < 2) {
      throw new AppError('At least 2 approved brokers are required for comparison.', StatusCodes.BAD_REQUEST);
    }

    return brokers;
  }

  /**
   * Add a review for a broker
   */
  async addReview(brokerId: string, userId: string, data: { rating: number; title: string; comment: string; pros?: string; cons?: string }) {
    const broker = await prisma.broker.findUnique({ where: { id: brokerId } });
    if (!broker) {
      throw new AppError('Broker not found.', StatusCodes.NOT_FOUND);
    }

    if (broker.userId === userId) {
      throw new AppError('You cannot review your own broker profile.', StatusCodes.FORBIDDEN);
    }

    const existingReview = await prisma.brokerReview.findFirst({
      where: { brokerId, userId },
    });

    if (existingReview) {
      throw new AppError('You have already submitted a review for this broker.', StatusCodes.CONFLICT);
    }

    const review = await prisma.brokerReview.create({
      data: {
        brokerId,
        userId,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        pros: data.pros,
        cons: data.cons,
        isApproved: false, // Requires admin moderation
      },
    });

    // Notify broker user
    await prisma.notification.create({
      data: {
        userId: broker.userId,
        type: NotificationType.REVIEW,
        title: 'New Review Submitted',
        message: `A client left a ${data.rating}-star review for ${broker.companyName}. Pending approval.`,
        link: `/dashboard/reviews`,
      },
    });

    return review;
  }

  /**
   * Get paginated approved reviews for a broker
   */
  async getReviews(brokerId: string, query: any) {
    const { skip, take, page, limit } = parsePagination(query);

    const [reviews, total] = await Promise.all([
      prisma.brokerReview.findMany({
        where: { brokerId, isApproved: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      }),
      prisma.brokerReview.count({ where: { brokerId, isApproved: true } }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { reviews, total, page, limit, totalPages };
  }

  /**
   * Broker responds to a user review
   */
  async respondToReview(reviewId: string, userId: string, responseText: string) {
    const broker = await prisma.broker.findUnique({ where: { userId } });
    if (!broker) {
      throw new AppError('Broker profile not found.', StatusCodes.NOT_FOUND);
    }

    const review = await prisma.brokerReview.findUnique({ where: { id: reviewId } });
    if (!review || review.brokerId !== broker.id) {
      throw new AppError('Review not found or unauthorized to respond.', StatusCodes.FORBIDDEN);
    }

    return await prisma.brokerReview.update({
      where: { id: reviewId },
      data: {
        brokerResponse: responseText,
        respondedAt: new Date(),
      },
    });
  }

  /**
   * Save or bookmark broker to user watchlist
   */
  async toggleSaveBroker(userId: string, brokerId: string) {
    const existing = await prisma.savedBroker.findUnique({
      where: { userId_brokerId: { userId, brokerId } },
    });

    if (existing) {
      await prisma.savedBroker.delete({
        where: { id: existing.id },
      });
      return { saved: false };
    } else {
      await prisma.savedBroker.create({
        data: { userId, brokerId },
      });
      return { saved: true };
    }
  }

  /**
   * Submit trader lead / inquiry to broker
   */
  async submitLead(brokerId: string, data: { name: string; email: string; phone?: string; message?: string; source?: string }) {
    const broker = await prisma.broker.findUnique({
      where: { id: brokerId },
      include: { user: true },
    });

    if (!broker || broker.status !== ApprovalStatus.APPROVED) {
      throw new AppError('Broker is not available to receive leads.', StatusCodes.NOT_FOUND);
    }

    const lead = await prisma.brokerLead.create({
      data: {
        brokerId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        source: data.source || 'BROKER_PROFILE_PAGE',
      },
    });

    await prisma.broker.update({
      where: { id: brokerId },
      data: { totalLeads: { increment: 1 } },
    });

    // Notify broker user in-app
    await prisma.notification.create({
      data: {
        userId: broker.userId,
        type: NotificationType.ENQUIRY,
        title: 'New Trader Lead Received',
        message: `${data.name} is interested in opening an account with ${broker.companyName}.`,
        link: `/dashboard/leads`,
      },
    });

    // Send email to broker contact
    transporter
      .sendMail({
        to: broker.user.email,
        subject: `New Trader Lead for ${broker.companyName}`,
        text: `You have received a new inquiry from ${data.name} (${data.email}, Phone: ${data.phone || 'N/A'}):\n\n${data.message || 'No additional message.'}`,
      })
      .catch(() => {});

    return lead;
  }

  /**
   * Get current broker dashboard profile with stats and leads
   */
  async getMyBrokerProfile(userId: string) {
    const broker = await prisma.broker.findUnique({
      where: { userId },
      include: {
        documents: true,
        leads: { orderBy: { createdAt: 'desc' }, take: 10 },
        reviews: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    if (!broker) {
      throw new AppError('Broker profile not found.', StatusCodes.NOT_FOUND);
    }

    return broker;
  }

  /**
   * Get broker leads with pagination for dashboard
   */
  async getMyLeads(userId: string, query: any) {
    const broker = await prisma.broker.findUnique({ where: { userId } });
    if (!broker) {
      throw new AppError('Broker profile not found.', StatusCodes.NOT_FOUND);
    }

    const { skip, take, page, limit } = parsePagination(query);
    const [leads, total] = await Promise.all([
      prisma.brokerLead.findMany({
        where: { brokerId: broker.id },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.brokerLead.count({ where: { brokerId: broker.id } }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { leads, total, page, limit, totalPages };
  }
}

export const brokerService = new BrokerService();
