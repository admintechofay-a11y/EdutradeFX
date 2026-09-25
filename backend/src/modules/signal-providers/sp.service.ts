import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { generateUniqueSlug } from '../../utils/slug.utils';
import { parsePagination } from '../../utils/pagination.utils';
import { ApprovalStatus, EnquiryTargetType, NotificationType, Prisma, Role, SignalStatus } from '@prisma/client';
import { transporter } from '../../config/email';

export class SignalProviderService {
  async registerSignalProvider(userId: string, data: any, photoFile?: Express.Multer.File, docFiles?: Express.Multer.File[]) {
    const existing = await prisma.signalProvider.findUnique({ where: { userId } });
    if (existing) {
      throw new AppError('A signal provider profile already exists for this account.', StatusCodes.CONFLICT);
    }

    const slug = await generateUniqueSlug(data.displayName, 'signalProvider');
    const photoUrl = photoFile ? (photoFile as any).path || (photoFile as any).secure_url : undefined;

    const sp = await prisma.signalProvider.create({
      data: {
        userId,
        displayName: data.displayName,
        slug,
        photo: photoUrl,
        bio: data.bio,
        instruments: Array.isArray(data.instruments) ? data.instruments : [data.instruments],
        strategy: data.strategy,
        riskCategory: data.riskCategory || 'MEDIUM',
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        status: ApprovalStatus.PENDING,
      },
    });

    if (docFiles && docFiles.length > 0) {
      await prisma.signalProviderDocument.createMany({
        data: docFiles.map((f) => ({
          signalProviderId: sp.id,
          fileUrl: (f as any).path || (f as any).secure_url || f.filename,
          fileName: f.originalname,
          docType: 'TRACK_RECORD_PROOF',
        })),
      });
    }

    // Notify admins
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: NotificationType.APPROVAL,
          title: 'New Signal Provider Registration',
          message: `${data.displayName} has registered for signal provider approval.`,
          link: `/admin/signal-providers/${sp.id}`,
        })),
      });
    }

    return sp;
  }

  async getSignalProviders(query: any) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.SignalProviderWhereInput = {
      status: ApprovalStatus.APPROVED,
    };

    if (query.search) {
      where.OR = [
        { displayName: { contains: query.search as string, mode: 'insensitive' } },
        { bio: { contains: query.search as string, mode: 'insensitive' } },
        { strategy: { contains: query.search as string, mode: 'insensitive' } },
      ];
    }

    if (query.instrument) {
      where.instruments = { has: query.instrument as string };
    }

    if (query.riskCategory) {
      where.riskCategory = query.riskCategory as string;
    }

    if (query.verificationStatus !== undefined) {
      where.verificationStatus = query.verificationStatus === 'true';
    }

    if (query.isFeatured !== undefined) {
      where.isFeatured = query.isFeatured === 'true';
    }

    let orderBy: Prisma.SignalProviderOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sortBy === 'avgRating') {
      orderBy = { avgRating: query.sortOrder === 'asc' ? 'asc' : 'desc' };
    } else if (query.sortBy === 'winRate') {
      orderBy = { winRate: query.sortOrder === 'asc' ? 'asc' : 'desc' };
    } else if (query.sortBy === 'totalSignals') {
      orderBy = { totalSignals: query.sortOrder === 'asc' ? 'asc' : 'desc' };
    }

    const [signalProviders, total] = await Promise.all([
      prisma.signalProvider.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          signals: {
            where: { status: SignalStatus.ACTIVE },
            take: 3,
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      prisma.signalProvider.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { signalProviders, total, page, limit, totalPages };
  }

  async getSignalProviderBySlug(slug: string, currentUserId?: string) {
    const sp = await prisma.signalProvider.findUnique({
      where: { slug },
      include: {
        documents: true,
        signals: {
          take: 15,
          orderBy: { createdAt: 'desc' },
        },
        reviews: {
          where: { isApproved: true },
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!sp) {
      throw new AppError('Signal Provider not found.', StatusCodes.NOT_FOUND);
    }

    const isOwner = currentUserId && sp.userId === currentUserId;
    let isAdmin = false;
    if (currentUserId && !isOwner) {
      const viewer = await prisma.user.findUnique({ where: { id: currentUserId }, select: { role: true } });
      isAdmin = viewer?.role === Role.ADMIN;
    }

    if (sp.status !== ApprovalStatus.APPROVED && !isOwner && !isAdmin) {
      throw new AppError('Signal Provider profile is currently unavailable.', StatusCodes.NOT_FOUND);
    }

    // Never leak private compliance documents to public visitors
    if (!isOwner && !isAdmin) {
      const { documents: _docs, ...publicSp } = sp as any;
      return publicSp;
    }

    return sp;
  }

  async updateSignalProvider(userId: string, data: any, photoFile?: Express.Multer.File) {
    const sp = await prisma.signalProvider.findUnique({ where: { userId } });
    if (!sp) {
      throw new AppError('Signal Provider profile not found.', StatusCodes.NOT_FOUND);
    }

    const photoUrl = photoFile ? (photoFile as any).path || (photoFile as any).secure_url : sp.photo;

    // Compliance Re-Review: If sensitive strategy/risk fields are changed, revert APPROVED to PENDING
    const hasSensitiveChanges = Boolean(
      (data.strategy !== undefined && data.strategy !== sp.strategy) ||
      (data.riskCategory !== undefined && data.riskCategory !== sp.riskCategory) ||
      (data.instruments && JSON.stringify(data.instruments) !== JSON.stringify(sp.instruments))
    );

    const newStatus = (sp.status === ApprovalStatus.APPROVED && hasSensitiveChanges)
      ? ApprovalStatus.PENDING
      : sp.status;

    return await prisma.signalProvider.update({
      where: { id: sp.id },
      data: {
        status: newStatus,
        ...(photoUrl && { photo: photoUrl }),
        ...(data.displayName && { displayName: data.displayName }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.instruments && { instruments: Array.isArray(data.instruments) ? data.instruments : [data.instruments] }),
        ...(data.strategy !== undefined && { strategy: data.strategy }),
        ...(data.riskCategory !== undefined && { riskCategory: data.riskCategory }),
        ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle }),
        ...(data.seoDescription !== undefined && { seoDescription: data.seoDescription }),
      },
    });
  }

  async uploadDocuments(userId: string, files: Express.Multer.File[]) {
    const sp = await prisma.signalProvider.findUnique({ where: { userId } });
    if (!sp) {
      throw new AppError('Signal Provider profile not found.', StatusCodes.NOT_FOUND);
    }

    if (!files || files.length === 0) {
      throw new AppError('No files uploaded.', StatusCodes.BAD_REQUEST);
    }

    const created = await prisma.signalProviderDocument.createMany({
      data: files.map((f) => ({
        signalProviderId: sp.id,
        fileUrl: (f as any).path || (f as any).secure_url || f.filename,
        fileName: f.originalname,
        docType: 'PERFORMANCE_DOCUMENT',
      })),
    });

    if (sp.status === ApprovalStatus.APPROVED) {
      await prisma.signalProvider.update({
        where: { id: sp.id },
        data: { status: ApprovalStatus.PENDING },
      });
    }

    return created;
  }

  async createSignal(userId: string, data: any) {
    let sp = await prisma.signalProvider.findUnique({ where: { userId } });
    if (!sp) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user && user.role === Role.ADMIN) {
        sp = await prisma.signalProvider.create({
          data: {
            userId: user.id,
            displayName: user.name || 'EdutradeFX Official Signals',
            slug: `official-signals-${Date.now().toString().slice(-4)}`,
            status: ApprovalStatus.APPROVED,
            verificationStatus: true,
            isFeatured: true,
            instruments: ['EUR/USD', 'GBP/USD', 'XAU/USD', 'USD/JPY'],
            strategy: 'Institutional Order Flow',
            riskCategory: 'MEDIUM',
          },
        });
      } else {
        throw new AppError('Signal Provider profile not found. Please complete your provider profile first.', StatusCodes.NOT_FOUND);
      }
    }

    if (sp.status !== ApprovalStatus.APPROVED) {
      if (process.env.ALLOW_MOCK_PAYMENTS === 'true' || process.env.NODE_ENV !== 'production') {
        sp = await prisma.signalProvider.update({
          where: { id: sp.id },
          data: { status: ApprovalStatus.APPROVED, verificationStatus: true },
        });
      } else {
        throw new AppError('Your profile must be approved by compliance before posting signals.', StatusCodes.FORBIDDEN);
      }
    }

    const title = data.title?.trim() || `${data.direction} ${data.instrument.toUpperCase()}`;

    const signal = await prisma.signal.create({
      data: {
        signalProviderId: sp.id,
        title,
        instrument: data.instrument.toUpperCase(),
        direction: data.direction,
        entryPrice: data.entryPrice ? parseFloat(data.entryPrice) : undefined,
        takeProfit: data.takeProfit ? parseFloat(data.takeProfit) : undefined,
        stopLoss: data.stopLoss ? parseFloat(data.stopLoss) : undefined,
        description: data.description,
        status: SignalStatus.ACTIVE,
      },
    });

    await prisma.signalProvider.update({
      where: { id: sp.id },
      data: { totalSignals: { increment: 1 } },
    });

    return signal;
  }

  async updateSignal(signalId: string, userId: string, data: any) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isAdmin = user?.role === Role.ADMIN;
    let sp = await prisma.signalProvider.findUnique({ where: { userId } });

    const signal = await prisma.signal.findUnique({ where: { id: signalId } });
    if (!signal) {
      throw new AppError('Signal not found.', StatusCodes.NOT_FOUND);
    }

    if (!isAdmin && (!sp || signal.signalProviderId !== sp.id)) {
      throw new AppError('Signal not found or unauthorized.', StatusCodes.FORBIDDEN);
    }

    const isClosing = data.status === SignalStatus.CLOSED && signal.status !== SignalStatus.CLOSED;

    const updated = await prisma.signal.update({
      where: { id: signalId },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.closedPrice !== undefined && { closedPrice: parseFloat(data.closedPrice) }),
        ...(data.pipsGained !== undefined && { pipsGained: parseFloat(data.pipsGained) }),
        ...(data.description !== undefined && { description: data.description }),
        ...(isClosing && { closedAt: new Date() }),
      },
    });

    // Recalculate win rate if closed signals exist
    if (isClosing && signal.signalProviderId) {
      const closedSignals = await prisma.signal.findMany({
        where: { signalProviderId: signal.signalProviderId, status: SignalStatus.CLOSED },
        select: { pipsGained: true },
      });

      if (closedSignals.length > 0) {
        const winningSignals = closedSignals.filter((s) => (s.pipsGained ?? 0) > 0).length;
        const winRate = parseFloat(((winningSignals / closedSignals.length) * 100).toFixed(1));
        await prisma.signalProvider.update({
          where: { id: signal.signalProviderId },
          data: { winRate },
        });
      }
    }

    return updated;
  }

  async deleteSignal(signalId: string, userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isAdmin = user?.role === Role.ADMIN;
    let sp = await prisma.signalProvider.findUnique({ where: { userId } });

    const signal = await prisma.signal.findUnique({ where: { id: signalId } });
    if (!signal) {
      throw new AppError('Signal not found.', StatusCodes.NOT_FOUND);
    }

    if (!isAdmin && (!sp || signal.signalProviderId !== sp.id)) {
      throw new AppError('Signal not found or unauthorized.', StatusCodes.FORBIDDEN);
    }

    await prisma.signal.delete({ where: { id: signalId } });
    if (signal.signalProviderId) {
      await prisma.signalProvider.update({
        where: { id: signal.signalProviderId },
        data: { totalSignals: { decrement: 1 } },
      });
    }

    return { message: 'Signal deleted successfully.' };
  }

  async getSignals(spId: string, query: any) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.SignalWhereInput = { signalProviderId: spId };
    if (query.status) {
      where.status = query.status as SignalStatus;
    }
    if (query.instrument) {
      where.instrument = { contains: query.instrument as string, mode: 'insensitive' };
    }

    const [signals, total] = await Promise.all([
      prisma.signal.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.signal.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { signals, total, page, limit, totalPages };
  }

  async addReview(spId: string, userId: string, data: { rating: number; comment: string }) {
    const sp = await prisma.signalProvider.findUnique({ where: { id: spId } });
    if (!sp) {
      throw new AppError('Signal Provider not found.', StatusCodes.NOT_FOUND);
    }

    if (sp.userId === userId) {
      throw new AppError('You cannot review your own signal provider profile.', StatusCodes.FORBIDDEN);
    }

    const existing = await prisma.signalProviderReview.findFirst({
      where: { signalProviderId: spId, userId },
    });

    if (existing) {
      throw new AppError('You have already submitted a review for this signal provider.', StatusCodes.CONFLICT);
    }

    const review = await prisma.signalProviderReview.create({
      data: {
        signalProviderId: spId,
        userId,
        rating: data.rating,
        comment: data.comment,
        isApproved: false,
      },
    });

    await prisma.notification.create({
      data: {
        userId: sp.userId,
        type: NotificationType.REVIEW,
        title: 'New Subscriber Review',
        message: `A client left a ${data.rating}-star review on your signal feed.`,
        link: `/dashboard/reviews`,
      },
    });

    return review;
  }

  async getReviews(spId: string, query: any) {
    const { skip, take, page, limit } = parsePagination(query);

    const [reviews, total] = await Promise.all([
      prisma.signalProviderReview.findMany({
        where: { signalProviderId: spId, isApproved: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      }),
      prisma.signalProviderReview.count({ where: { signalProviderId: spId, isApproved: true } }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { reviews, total, page, limit, totalPages };
  }

  async sendEnquiry(spId: string, data: { name: string; email: string; phone?: string; message: string }, currentUserId?: string) {
    const sp = await prisma.signalProvider.findUnique({
      where: { id: spId },
      include: { user: true },
    });

    if (!sp || sp.status !== ApprovalStatus.APPROVED) {
      throw new AppError('Signal Provider not available for inquiries.', StatusCodes.NOT_FOUND);
    }

    const enquiry = await prisma.enquiry.create({
      data: {
        userId: currentUserId,
        signalProviderId: sp.id,
        targetType: EnquiryTargetType.SIGNAL_PROVIDER,
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
      },
    });

    await prisma.notification.create({
      data: {
        userId: sp.userId,
        type: NotificationType.ENQUIRY,
        title: 'New Signal Subscription Inquiry',
        message: `${data.name} sent an enquiry regarding your signals.`,
        link: `/dashboard/enquiries`,
      },
    });

    transporter
      .sendMail({
        to: sp.user.email,
        subject: `New Signals Inquiry from ${data.name}`,
        text: `You have received an inquiry from ${data.name} (${data.email}, Phone: ${data.phone || 'N/A'}):\n\n${data.message}`,
      })
      .catch(() => {});

    return enquiry;
  }

  async getMySPProfile(userId: string) {
    let sp = await prisma.signalProvider.findUnique({
      where: { userId },
      include: {
        documents: true,
        signals: { orderBy: { createdAt: 'desc' }, take: 10 },
        reviews: { orderBy: { createdAt: 'desc' }, take: 5 },
        enquiries: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    if (!sp) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user && user.role === Role.ADMIN) {
        sp = await prisma.signalProvider.create({
          data: {
            userId: user.id,
            displayName: user.name || 'EdutradeFX Official Signals',
            slug: `official-signals-${Date.now().toString().slice(-4)}`,
            status: ApprovalStatus.APPROVED,
            verificationStatus: true,
            isFeatured: true,
            instruments: ['EUR/USD', 'GBP/USD', 'XAU/USD', 'USD/JPY'],
            strategy: 'Institutional Order Flow',
            riskCategory: 'MEDIUM',
          },
          include: {
            documents: true,
            signals: true,
            reviews: true,
            enquiries: true,
          },
        });
      } else {
        throw new AppError('Signal Provider profile not found.', StatusCodes.NOT_FOUND);
      }
    }

    return sp;
  }

  async getMySignals(userId: string, query: any) {
    let sp = await prisma.signalProvider.findUnique({ where: { userId } });
    if (!sp) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user && user.role === Role.ADMIN) {
        sp = await prisma.signalProvider.create({
          data: {
            userId: user.id,
            displayName: user.name || 'EdutradeFX Official Signals',
            slug: `official-signals-${Date.now().toString().slice(-4)}`,
            status: ApprovalStatus.APPROVED,
            verificationStatus: true,
            isFeatured: true,
            instruments: ['EUR/USD', 'GBP/USD', 'XAU/USD', 'USD/JPY'],
            strategy: 'Institutional Order Flow',
            riskCategory: 'MEDIUM',
          },
        });
      } else {
        return { signals: [], total: 0, page: 1, limit: 20, totalPages: 1 };
      }
    }

    const { skip, take, page, limit } = parsePagination(query);
    const where: Prisma.SignalWhereInput = { signalProviderId: sp.id };

    if (query.status) {
      where.status = query.status as SignalStatus;
    }

    const [signals, total] = await Promise.all([
      prisma.signal.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.signal.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { signals, total, page, limit, totalPages };
  }
}

export const signalProviderService = new SignalProviderService();
