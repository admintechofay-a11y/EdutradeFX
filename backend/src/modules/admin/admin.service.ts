import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { parsePagination } from '../../utils/pagination.utils';
import { hashPassword, generateSecureToken, hashToken } from '../../utils/bcrypt.utils';
import {
  sendApprovalEmail,
  sendRejectionEmail,
  sendPayoutProcessed,
  sendPasswordResetEmail,
} from '../../utils/email.utils';
import {
  ApprovalStatus,
  CourseStatus,
  NotificationType,
  OrderStatus,
  PayoutStatus,
  Prisma,
  Role,
} from '@prisma/client';

export class AdminService {
  // ── 1. DASHBOARD OVERVIEW & KPIS ───────────────────────────

  async getDashboardStats() {
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      studentUsers,
      brokerUsers,
      amUsers,
      spUsers,
      tutorUsers,
      newUsersThisMonth,
      totalBrokers,
      pendingBrokers,
      approvedBrokers,
      rejectedBrokers,
      suspendedBrokers,
      featuredBrokers,
      totalCourses,
      draftCourses,
      reviewCourses,
      publishedCourses,
      archivedCourses,
      totalOrders,
      paidOrders,
      totalEnrollments,
      enrollmentsThisMonth,
      openComplaints,
      inReviewComplaints,
      resolvedComplaints,
      totalAMs,
      pendingAMs,
      approvedAMs,
      totalSPs,
      pendingSPs,
      approvedSPs,
      recentUsers,
      recentOrders,
      recentComplaints,
      topCourses,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: Role.STUDENT } }),
      prisma.user.count({ where: { role: Role.BROKER } }),
      prisma.user.count({ where: { role: Role.ACCOUNT_MANAGER } }),
      prisma.user.count({ where: { role: Role.SIGNAL_PROVIDER } }),
      prisma.user.count({ where: { role: Role.TUTOR } }),
      prisma.user.count({ where: { createdAt: { gte: firstDayThisMonth } } }),
      prisma.broker.count(),
      prisma.broker.count({ where: { status: ApprovalStatus.PENDING } }),
      prisma.broker.count({ where: { status: ApprovalStatus.APPROVED } }),
      prisma.broker.count({ where: { status: ApprovalStatus.REJECTED } }),
      prisma.broker.count({ where: { status: ApprovalStatus.SUSPENDED } }),
      prisma.broker.count({ where: { isFeatured: true } }),
      prisma.course.count(),
      prisma.course.count({ where: { status: CourseStatus.DRAFT } }),
      prisma.course.count({ where: { status: CourseStatus.REVIEW } }),
      prisma.course.count({ where: { status: CourseStatus.PUBLISHED } }),
      prisma.course.count({ where: { status: CourseStatus.ARCHIVED } }),
      prisma.order.count(),
      prisma.order.findMany({ where: { status: OrderStatus.PAID } }),
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { enrolledAt: { gte: firstDayThisMonth } } }),
      prisma.complaint.count({ where: { status: 'OPEN' } }),
      prisma.complaint.count({ where: { status: 'IN_REVIEW' } }),
      prisma.complaint.count({ where: { status: 'RESOLVED' } }),
      prisma.accountManager.count(),
      prisma.accountManager.count({ where: { status: ApprovalStatus.PENDING } }),
      prisma.accountManager.count({ where: { status: ApprovalStatus.APPROVED } }),
      prisma.signalProvider.count(),
      prisma.signalProvider.count({ where: { status: ApprovalStatus.PENDING } }),
      prisma.signalProvider.count({ where: { status: ApprovalStatus.APPROVED } }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, createdAt: true, isActive: true },
      }),
      prisma.order.findMany({
        take: 5,
        where: { status: OrderStatus.PAID },
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          course: { select: { title: true } },
        },
      }),
      prisma.complaint.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } },
      }),
      prisma.course.findMany({
        take: 5,
        where: { status: CourseStatus.PUBLISHED },
        orderBy: { totalEnrollments: 'desc' },
        select: { id: true, title: true, totalEnrollments: true, avgRating: true, price: true },
      }),
    ]);

    const totalRevenue = paidOrders.reduce((acc, o) => acc + o.amount, 0);
    const thisMonthRevenue = paidOrders
      .filter((o) => new Date(o.createdAt) >= firstDayThisMonth)
      .reduce((acc, o) => acc + o.amount, 0);
    const platformEarnings = (totalRevenue * 0.2); // 20% platform cut

    // Monthly revenue data aggregation (last 12 months)
    const monthlyRevenue = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'short' });
      const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const sum = paidOrders
        .filter((o) => {
          const created = new Date(o.createdAt);
          return created >= d && created < nextMonth;
        })
        .reduce((acc, o) => acc + o.amount, 0);

      monthlyRevenue.push({ month: monthName, revenue: sum, year: d.getFullYear() });
    }

    return {
      totalUsers,
      totalBrokers,
      totalCourses,
      openComplaints,
      totalRevenue,
      users: {
        total: totalUsers,
        students: studentUsers,
        brokers: brokerUsers,
        accountManagers: amUsers,
        signalProviders: spUsers,
        tutors: tutorUsers,
        newThisMonth: newUsersThisMonth,
      },
      brokers: {
        total: totalBrokers,
        pending: pendingBrokers,
        approved: approvedBrokers,
        rejected: rejectedBrokers,
        suspended: suspendedBrokers,
        featured: featuredBrokers,
      },
      courses: {
        total: totalCourses,
        draft: draftCourses,
        review: reviewCourses,
        published: publishedCourses,
        archived: archivedCourses,
      },
      revenue: {
        totalOrders,
        totalRevenue,
        thisMonthRevenue,
        platformEarnings,
      },
      enrollments: {
        total: totalEnrollments,
        thisMonth: enrollmentsThisMonth,
      },
      complaints: {
        open: openComplaints,
        inReview: inReviewComplaints,
        resolved: resolvedComplaints,
      },
      accountManagers: {
        total: totalAMs,
        pending: pendingAMs,
        approved: approvedAMs,
      },
      signalProviders: {
        total: totalSPs,
        pending: pendingSPs,
        approved: approvedSPs,
      },
      recentUsers,
      recentOrders,
      recentComplaints,
      monthlyRevenue,
      topCourses,
    };
  }

  // ── 2. USER MANAGEMENT ─────────────────────────────────────

  async getAllUsers(query: any) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.UserWhereInput = {};
    if (query.role) {
      where.role = query.role as Role;
    }
    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true';
    }
    if (query.isEmailVerified !== undefined) {
      where.isEmailVerified = query.isEmailVerified === 'true';
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search as string, mode: 'insensitive' } },
        { email: { contains: query.search as string, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          phone: true,
          isActive: true,
          isEmailVerified: true,
          createdAt: true,
          lastLoginAt: true,
          broker: { select: { id: true, companyName: true, status: true } },
          accountManager: { select: { id: true, fullName: true, status: true } },
          signalProvider: { select: { id: true, displayName: true, status: true } },
          tutor: { select: { id: true, status: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { users, total, page, limit, totalPages };
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        broker: true,
        accountManager: true,
        signalProvider: true,
        tutor: true,
        orders: { take: 5, orderBy: { createdAt: 'desc' } },
        complaints: { take: 5, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!user) throw new AppError('User not found.', StatusCodes.NOT_FOUND);

    const { password, emailVerifyToken, resetToken, twoFactorSecret, ...safeUser } = user;
    return safeUser;
  }

  async updateUserStatus(id: string, isActive: boolean) {
    return await prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, name: true, email: true, isActive: true },
    });
  }

  async deleteUser(id: string, actorId?: string) {
    if (actorId && actorId === id) {
      throw new AppError('Admins cannot delete their own account.', StatusCodes.BAD_REQUEST);
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      throw new AppError('User not found.', StatusCodes.NOT_FOUND);
    }

    if (targetUser.role === Role.ADMIN) {
      const activeAdminCount = await prisma.user.count({
        where: { role: Role.ADMIN, isActive: true },
      });
      if (activeAdminCount <= 1) {
        throw new AppError('Cannot delete the final active administrator on the system.', StatusCodes.BAD_REQUEST);
      }
    }

    await prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully.' };
  }

  async resetUserPassword(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError('User not found.', StatusCodes.NOT_FOUND);

    const rawToken = generateSecureToken();
    const hashed = hashToken(rawToken);
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.$transaction([
      prisma.user.update({
        where: { id },
        data: { resetToken: hashed, resetTokenExpiry: expiry },
      }),
      prisma.refreshToken.updateMany({
        where: { userId: id },
        data: { isRevoked: true },
      }),
    ]);

    sendPasswordResetEmail(user.email, user.name, rawToken).catch(() => {});
    return { message: 'Password reset dispatch sent to user email.' };
  }

  // ── 3. BROKER COMPLIANCE & REVIEWS ─────────────────────────

  async getPendingBrokersAdmin() {
    return await prisma.broker.findMany({
      where: { status: ApprovalStatus.PENDING },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        _count: { select: { reviews: true, leads: true, documents: true } },
      },
    });
  }

  async getAllBrokersAdmin(query: any) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.BrokerWhereInput = {};
    if (query.status) where.status = query.status as ApprovalStatus;
    if (query.search) {
      where.OR = [
        { companyName: { contains: query.search as string, mode: 'insensitive' } },
        { description: { contains: query.search as string, mode: 'insensitive' } },
      ];
    }

    const [brokers, total] = await Promise.all([
      prisma.broker.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          _count: { select: { reviews: true, leads: true, documents: true } },
        },
      }),
      prisma.broker.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { brokers, total, page, limit, totalPages };
  }

  async updateBrokerStatus(brokerId: string, status: ApprovalStatus, rejectionReason?: string) {
    const broker = await prisma.broker.findUnique({
      where: { id: brokerId },
      include: { user: true },
    });

    if (!broker) throw new AppError('Broker not found.', StatusCodes.NOT_FOUND);

    const updated = await prisma.broker.update({
      where: { id: brokerId },
      data: { status },
    });

    if (status === ApprovalStatus.APPROVED) {
      sendApprovalEmail(broker.user.email, broker.user.name, 'Broker Profile').catch(() => {});
    } else if (status === ApprovalStatus.REJECTED) {
      sendRejectionEmail(broker.user.email, broker.user.name, 'Broker Profile', rejectionReason).catch(() => {});
    }

    return updated;
  }

  async toggleBrokerFeatured(brokerId: string, isFeatured: boolean) {
    return await prisma.broker.update({
      where: { id: brokerId },
      data: {
        isFeatured,
        featuredUntil: isFeatured ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
      },
    });
  }

  async createBrokerAdmin(data: any) {
    const slug = data.slug || `${data.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
    const userId = data.userId;
    if (!userId) {
      throw new AppError('Explicit userId is required to associate this broker profile.', StatusCodes.BAD_REQUEST);
    }
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      throw new AppError('The specified user account (userId) does not exist.', StatusCodes.NOT_FOUND);
    }
    return await prisma.broker.create({
      data: {
        userId,
        companyName: data.companyName,
        slug,
        logo: data.logo || null,
        website: data.website || null,
        description: data.description || null,
        headquarters: data.headquarters || null,
        yearFounded: data.yearFounded ? parseInt(data.yearFounded) : null,
        countries: Array.isArray(data.countries) ? data.countries : (data.countries ? String(data.countries).split(',').map((s: string) => s.trim()) : []),
        regulation: Array.isArray(data.regulation) ? data.regulation : (data.regulation ? String(data.regulation).split(',').map((s: string) => s.trim()) : []),
        tradingPlatforms: Array.isArray(data.tradingPlatforms) ? data.tradingPlatforms : (data.tradingPlatforms ? String(data.tradingPlatforms).split(',').map((s: string) => s.trim()) : ['MT4', 'MT5']),
        accountTypes: Array.isArray(data.accountTypes) ? data.accountTypes : (data.accountTypes ? String(data.accountTypes).split(',').map((s: string) => s.trim()) : ['Standard', 'ECN']),
        minDeposit: data.minDeposit ? parseFloat(data.minDeposit) : 0,
        maxLeverage: data.maxLeverage || '1:500',
        spreadsFrom: data.spreadsFrom || '0.0 Pips',
        commissions: data.commissions || '$0',
        executionType: data.executionType || 'ECN/STP',
        riskDisclaimer: data.riskDisclaimer || null,
        depositMethods: Array.isArray(data.depositMethods) ? data.depositMethods : (data.depositMethods ? String(data.depositMethods).split(',').map((s: string) => s.trim()) : ['Bank Wire', 'Credit Card', 'Crypto']),
        withdrawMethods: Array.isArray(data.withdrawMethods) ? data.withdrawMethods : (data.withdrawMethods ? String(data.withdrawMethods).split(',').map((s: string) => s.trim()) : ['Bank Wire', 'Credit Card', 'Crypto']),
        status: data.status || ApprovalStatus.APPROVED,
        isFeatured: data.isFeatured === true || data.isFeatured === 'true',
      },
    });
  }

  async updateBrokerAdmin(brokerId: string, data: any) {
    const broker = await prisma.broker.findUnique({ where: { id: brokerId } });
    if (!broker) throw new AppError('Broker not found.', StatusCodes.NOT_FOUND);

    return await prisma.broker.update({
      where: { id: brokerId },
      data: {
        companyName: data.companyName !== undefined ? data.companyName : broker.companyName,
        logo: data.logo !== undefined ? data.logo : broker.logo,
        website: data.website !== undefined ? data.website : broker.website,
        description: data.description !== undefined ? data.description : broker.description,
        headquarters: data.headquarters !== undefined ? data.headquarters : broker.headquarters,
        yearFounded: data.yearFounded !== undefined ? (data.yearFounded ? parseInt(data.yearFounded) : null) : broker.yearFounded,
        countries: Array.isArray(data.countries) ? data.countries : (data.countries !== undefined ? String(data.countries).split(',').map((s: string) => s.trim()) : broker.countries),
        regulation: Array.isArray(data.regulation) ? data.regulation : (data.regulation !== undefined ? String(data.regulation).split(',').map((s: string) => s.trim()) : broker.regulation),
        tradingPlatforms: Array.isArray(data.tradingPlatforms) ? data.tradingPlatforms : (data.tradingPlatforms !== undefined ? String(data.tradingPlatforms).split(',').map((s: string) => s.trim()) : broker.tradingPlatforms),
        accountTypes: Array.isArray(data.accountTypes) ? data.accountTypes : (data.accountTypes !== undefined ? String(data.accountTypes).split(',').map((s: string) => s.trim()) : broker.accountTypes),
        minDeposit: data.minDeposit !== undefined ? (data.minDeposit ? parseFloat(data.minDeposit) : null) : broker.minDeposit,
        maxLeverage: data.maxLeverage !== undefined ? data.maxLeverage : broker.maxLeverage,
        spreadsFrom: data.spreadsFrom !== undefined ? data.spreadsFrom : broker.spreadsFrom,
        commissions: data.commissions !== undefined ? data.commissions : broker.commissions,
        executionType: data.executionType !== undefined ? data.executionType : broker.executionType,
        riskDisclaimer: data.riskDisclaimer !== undefined ? data.riskDisclaimer : broker.riskDisclaimer,
        depositMethods: Array.isArray(data.depositMethods) ? data.depositMethods : (data.depositMethods !== undefined ? String(data.depositMethods).split(',').map((s: string) => s.trim()) : broker.depositMethods),
        withdrawMethods: Array.isArray(data.withdrawMethods) ? data.withdrawMethods : (data.withdrawMethods !== undefined ? String(data.withdrawMethods).split(',').map((s: string) => s.trim()) : broker.withdrawMethods),
        status: data.status !== undefined ? data.status : broker.status,
        isFeatured: data.isFeatured !== undefined ? Boolean(data.isFeatured) : broker.isFeatured,
      },
    });
  }

  async deleteBrokerAdmin(brokerId: string) {
    const broker = await prisma.broker.findUnique({ where: { id: brokerId } });
    if (!broker) throw new AppError('Broker not found.', StatusCodes.NOT_FOUND);
    await prisma.broker.delete({ where: { id: brokerId } });
    return { message: 'Broker deleted successfully.' };
  }

  async approveBrokerReview(reviewId: string) {
    const review = await prisma.brokerReview.update({
      where: { id: reviewId },
      data: { isApproved: true },
    });

    // Recalculate broker's average rating
    const approvedReviews = await prisma.brokerReview.findMany({
      where: { brokerId: review.brokerId, isApproved: true },
      select: { rating: true },
    });

    const avgRating =
      approvedReviews.reduce((sum, r) => sum + r.rating, 0) / (approvedReviews.length || 1);

    await prisma.broker.update({
      where: { id: review.brokerId },
      data: {
        avgRating: parseFloat(avgRating.toFixed(1)),
        totalReviews: approvedReviews.length,
      },
    });

    return review;
  }

  async deleteBrokerReview(reviewId: string) {
    const review = await prisma.brokerReview.delete({ where: { id: reviewId } });

    // Recalculate rating
    const approvedReviews = await prisma.brokerReview.findMany({
      where: { brokerId: review.brokerId, isApproved: true },
      select: { rating: true },
    });

    const avgRating =
      approvedReviews.length > 0
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
        : 0;

    await prisma.broker.update({
      where: { id: review.brokerId },
      data: {
        avgRating: parseFloat(avgRating.toFixed(1)),
        totalReviews: approvedReviews.length,
      },
    });

    return { message: 'Review removed.' };
  }

  async approveAccountManagerReview(reviewId: string) {
    const review = await prisma.accountManagerReview.update({
      where: { id: reviewId },
      data: { isApproved: true },
    });

    const approvedReviews = await prisma.accountManagerReview.findMany({
      where: { accountManagerId: review.accountManagerId, isApproved: true },
      select: { rating: true },
    });

    const avgRating =
      approvedReviews.reduce((sum, r) => sum + r.rating, 0) / (approvedReviews.length || 1);

    await prisma.accountManager.update({
      where: { id: review.accountManagerId },
      data: {
        avgRating: parseFloat(avgRating.toFixed(1)),
        totalReviews: approvedReviews.length,
      },
    });

    return review;
  }

  async deleteAccountManagerReview(reviewId: string) {
    const review = await prisma.accountManagerReview.delete({ where: { id: reviewId } });
    const approvedReviews = await prisma.accountManagerReview.findMany({
      where: { accountManagerId: review.accountManagerId, isApproved: true },
      select: { rating: true },
    });

    const avgRating = approvedReviews.length
      ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
      : 0;

    await prisma.accountManager.update({
      where: { id: review.accountManagerId },
      data: {
        avgRating: parseFloat(avgRating.toFixed(1)),
        totalReviews: approvedReviews.length,
      },
    });

    return { message: 'Review deleted successfully.' };
  }

  async approveSignalProviderReview(reviewId: string) {
    const review = await prisma.signalProviderReview.update({
      where: { id: reviewId },
      data: { isApproved: true },
    });

    const approvedReviews = await prisma.signalProviderReview.findMany({
      where: { signalProviderId: review.signalProviderId, isApproved: true },
      select: { rating: true },
    });

    const avgRating =
      approvedReviews.reduce((sum, r) => sum + r.rating, 0) / (approvedReviews.length || 1);

    await prisma.signalProvider.update({
      where: { id: review.signalProviderId },
      data: {
        avgRating: parseFloat(avgRating.toFixed(1)),
        totalReviews: approvedReviews.length,
      },
    });

    return review;
  }

  async deleteSignalProviderReview(reviewId: string) {
    const review = await prisma.signalProviderReview.delete({ where: { id: reviewId } });
    const approvedReviews = await prisma.signalProviderReview.findMany({
      where: { signalProviderId: review.signalProviderId, isApproved: true },
      select: { rating: true },
    });

    const avgRating = approvedReviews.length
      ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
      : 0;

    await prisma.signalProvider.update({
      where: { id: review.signalProviderId },
      data: {
        avgRating: parseFloat(avgRating.toFixed(1)),
        totalReviews: approvedReviews.length,
      },
    });

    return { message: 'Review deleted successfully.' };
  }

  async approveCourseReview(reviewId: string) {
    const review = await prisma.courseReview.update({
      where: { id: reviewId },
      data: { isApproved: true },
    });

    const approvedReviews = await prisma.courseReview.findMany({
      where: { courseId: review.courseId, isApproved: true },
      select: { rating: true },
    });

    const avgRating =
      approvedReviews.reduce((sum, r) => sum + r.rating, 0) / (approvedReviews.length || 1);

    await prisma.course.update({
      where: { id: review.courseId },
      data: {
        avgRating: parseFloat(avgRating.toFixed(1)),
        totalReviews: approvedReviews.length,
      },
    });

    return review;
  }

  async deleteCourseReview(reviewId: string) {
    const review = await prisma.courseReview.delete({ where: { id: reviewId } });
    const approvedReviews = await prisma.courseReview.findMany({
      where: { courseId: review.courseId, isApproved: true },
      select: { rating: true },
    });

    const avgRating = approvedReviews.length
      ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
      : 0;

    await prisma.course.update({
      where: { id: review.courseId },
      data: {
        avgRating: parseFloat(avgRating.toFixed(1)),
        totalReviews: approvedReviews.length,
      },
    });

    return { message: 'Review deleted successfully.' };
  }

  // ── 4. ACCOUNT MANAGERS & SIGNAL PROVIDERS ─────────────────

  async getAllAMsAdmin(query: any) {
    const { skip, take, page, limit } = parsePagination(query);
    const where: Prisma.AccountManagerWhereInput = {};
    if (query.status) where.status = query.status as ApprovalStatus;

    const [accountManagers, total] = await Promise.all([
      prisma.accountManager.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          _count: { select: { reviews: true, enquiries: true } },
        },
      }),
      prisma.accountManager.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { accountManagers, total, page, limit, totalPages };
  }

  async updateAMStatus(amId: string, status: ApprovalStatus) {
    return await prisma.accountManager.update({
      where: { id: amId },
      data: { status },
    });
  }

  async toggleAMFeatured(amId: string, isFeatured: boolean) {
    return await prisma.accountManager.update({
      where: { id: amId },
      data: { isFeatured },
    });
  }

  async createAMAdmin(data: any) {
    const slug = data.slug || `${data.fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
    const userId = data.userId;
    if (!userId) {
      throw new AppError('Explicit userId is required to associate this account manager profile.', StatusCodes.BAD_REQUEST);
    }
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      throw new AppError('The specified user account (userId) does not exist.', StatusCodes.NOT_FOUND);
    }
    return await prisma.accountManager.create({
      data: {
        userId,
        fullName: data.fullName,
        slug,
        photo: data.photo || null,
        tagline: data.tagline || null,
        bio: data.bio || null,
        expertise: Array.isArray(data.expertise) ? data.expertise : (data.expertise ? String(data.expertise).split(',').map((s: string) => s.trim()) : []),
        languages: Array.isArray(data.languages) ? data.languages : (data.languages ? String(data.languages).split(',').map((s: string) => s.trim()) : ['English']),
        country: data.country || null,
        city: data.city || null,
        yearsExperience: data.yearsExperience ? parseInt(data.yearsExperience) : null,
        services: Array.isArray(data.services) ? data.services : (data.services ? String(data.services).split(',').map((s: string) => s.trim()) : ['PAMM', 'MAM']),
        availability: data.availability || 'Accepting New Clients',
        strategy: data.strategy || null,
        minInvestment: data.minInvestment ? parseFloat(data.minInvestment) : null,
        historicalPerformance: data.historicalPerformance || null,
        riskInfo: data.riskInfo || null,
        tradingStyle: data.tradingStyle || null,
        website: data.website || null,
        disclaimer: data.disclaimer || null,
        status: data.status || ApprovalStatus.APPROVED,
        isFeatured: data.isFeatured === true || data.isFeatured === 'true',
      },
    });
  }

  async updateAMAdmin(amId: string, data: any) {
    const am = await prisma.accountManager.findUnique({ where: { id: amId } });
    if (!am) throw new AppError('Account manager not found.', StatusCodes.NOT_FOUND);

    return await prisma.accountManager.update({
      where: { id: amId },
      data: {
        fullName: data.fullName !== undefined ? data.fullName : am.fullName,
        photo: data.photo !== undefined ? data.photo : am.photo,
        tagline: data.tagline !== undefined ? data.tagline : am.tagline,
        bio: data.bio !== undefined ? data.bio : am.bio,
        expertise: Array.isArray(data.expertise) ? data.expertise : (data.expertise !== undefined ? String(data.expertise).split(',').map((s: string) => s.trim()) : am.expertise),
        languages: Array.isArray(data.languages) ? data.languages : (data.languages !== undefined ? String(data.languages).split(',').map((s: string) => s.trim()) : am.languages),
        country: data.country !== undefined ? data.country : am.country,
        city: data.city !== undefined ? data.city : am.city,
        yearsExperience: data.yearsExperience !== undefined ? (data.yearsExperience ? parseInt(data.yearsExperience) : null) : am.yearsExperience,
        services: Array.isArray(data.services) ? data.services : (data.services !== undefined ? String(data.services).split(',').map((s: string) => s.trim()) : am.services),
        availability: data.availability !== undefined ? data.availability : am.availability,
        strategy: data.strategy !== undefined ? data.strategy : am.strategy,
        minInvestment: data.minInvestment !== undefined ? (data.minInvestment ? parseFloat(data.minInvestment) : null) : am.minInvestment,
        historicalPerformance: data.historicalPerformance !== undefined ? data.historicalPerformance : am.historicalPerformance,
        riskInfo: data.riskInfo !== undefined ? data.riskInfo : am.riskInfo,
        tradingStyle: data.tradingStyle !== undefined ? data.tradingStyle : am.tradingStyle,
        website: data.website !== undefined ? data.website : am.website,
        disclaimer: data.disclaimer !== undefined ? data.disclaimer : am.disclaimer,
        status: data.status !== undefined ? data.status : am.status,
        isFeatured: data.isFeatured !== undefined ? Boolean(data.isFeatured) : am.isFeatured,
      },
    });
  }

  async deleteAMAdmin(amId: string) {
    const am = await prisma.accountManager.findUnique({ where: { id: amId } });
    if (!am) throw new AppError('Account manager not found.', StatusCodes.NOT_FOUND);
    await prisma.accountManager.delete({ where: { id: amId } });
    return { message: 'Account manager deleted successfully.' };
  }

  async getAllSPsAdmin(query: any) {
    const { skip, take, page, limit } = parsePagination(query);
    const where: Prisma.SignalProviderWhereInput = {};
    if (query.status) where.status = query.status as ApprovalStatus;

    const [signalProviders, total] = await Promise.all([
      prisma.signalProvider.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          _count: { select: { signals: true, reviews: true, enquiries: true } },
        },
      }),
      prisma.signalProvider.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { signalProviders, total, page, limit, totalPages };
  }

  async updateSPStatus(spId: string, status: ApprovalStatus) {
    return await prisma.signalProvider.update({
      where: { id: spId },
      data: { status },
    });
  }

  async toggleSPVerification(spId: string, verificationStatus: boolean) {
    return await prisma.signalProvider.update({
      where: { id: spId },
      data: { verificationStatus },
    });
  }

  async toggleSPFeatured(spId: string, isFeatured: boolean) {
    return await prisma.signalProvider.update({
      where: { id: spId },
      data: { isFeatured },
    });
  }

  async createSPAdmin(data: any) {
    const slug = data.slug || `${data.displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
    const userId = data.userId;
    if (!userId) {
      throw new AppError('Explicit userId is required to associate this signal provider profile.', StatusCodes.BAD_REQUEST);
    }
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      throw new AppError('The specified user account (userId) does not exist.', StatusCodes.NOT_FOUND);
    }
    return await prisma.signalProvider.create({
      data: {
        userId,
        displayName: data.displayName,
        slug,
        photo: data.photo || null,
        bio: data.bio || null,
        instruments: Array.isArray(data.instruments) ? data.instruments : (data.instruments ? String(data.instruments).split(',').map((s: string) => s.trim()) : ['EUR/USD', 'GBP/USD']),
        strategy: data.strategy || null,
        riskCategory: data.riskCategory || 'Medium',
        winRate: data.winRate ? parseFloat(data.winRate) : 75,
        subscriptionPrice: data.subscriptionPrice ? parseFloat(data.subscriptionPrice) : 0,
        historicalPerformance: data.historicalPerformance || null,
        website: data.website || null,
        disclaimer: data.disclaimer || null,
        verificationStatus: data.verificationStatus === true || data.verificationStatus === 'true',
        status: data.status || ApprovalStatus.APPROVED,
        isFeatured: data.isFeatured === true || data.isFeatured === 'true',
      },
    });
  }

  async updateSPAdmin(spId: string, data: any) {
    const sp = await prisma.signalProvider.findUnique({ where: { id: spId } });
    if (!sp) throw new AppError('Signal provider not found.', StatusCodes.NOT_FOUND);

    return await prisma.signalProvider.update({
      where: { id: spId },
      data: {
        displayName: data.displayName !== undefined ? data.displayName : sp.displayName,
        photo: data.photo !== undefined ? data.photo : sp.photo,
        bio: data.bio !== undefined ? data.bio : sp.bio,
        instruments: Array.isArray(data.instruments) ? data.instruments : (data.instruments !== undefined ? String(data.instruments).split(',').map((s: string) => s.trim()) : sp.instruments),
        strategy: data.strategy !== undefined ? data.strategy : sp.strategy,
        riskCategory: data.riskCategory !== undefined ? data.riskCategory : sp.riskCategory,
        winRate: data.winRate !== undefined ? (data.winRate ? parseFloat(data.winRate) : null) : sp.winRate,
        subscriptionPrice: data.subscriptionPrice !== undefined ? (data.subscriptionPrice ? parseFloat(data.subscriptionPrice) : null) : sp.subscriptionPrice,
        historicalPerformance: data.historicalPerformance !== undefined ? data.historicalPerformance : sp.historicalPerformance,
        website: data.website !== undefined ? data.website : sp.website,
        disclaimer: data.disclaimer !== undefined ? data.disclaimer : sp.disclaimer,
        verificationStatus: data.verificationStatus !== undefined ? Boolean(data.verificationStatus) : sp.verificationStatus,
        status: data.status !== undefined ? data.status : sp.status,
        isFeatured: data.isFeatured !== undefined ? Boolean(data.isFeatured) : sp.isFeatured,
      },
    });
  }

  async deleteSPAdmin(spId: string) {
    const sp = await prisma.signalProvider.findUnique({ where: { id: spId } });
    if (!sp) throw new AppError('Signal provider not found.', StatusCodes.NOT_FOUND);
    await prisma.signalProvider.delete({ where: { id: spId } });
    return { message: 'Signal provider deleted successfully.' };
  }

  // ── 5. LMS TUTORS & COURSES ────────────────────────────────

  async getAllTutorsAdmin(query: any) {
    const { skip, take, page, limit } = parsePagination(query);
    const where: Prisma.TutorWhereInput = {};
    if (query.status) where.status = query.status as ApprovalStatus;

    const [tutors, total] = await Promise.all([
      prisma.tutor.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          _count: { select: { courses: true, payouts: true } },
        },
      }),
      prisma.tutor.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { tutors, total, page, limit, totalPages };
  }

  async updateTutorStatus(tutorId: string, status: ApprovalStatus) {
    return await prisma.tutor.update({
      where: { id: tutorId },
      data: { status },
    });
  }

  async getAllCoursesAdmin(query: any) {
    const { skip, take, page, limit } = parsePagination(query);
    const where: Prisma.CourseWhereInput = {};
    if (query.status) where.status = query.status as CourseStatus;

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          tutor: {
            include: { user: { select: { name: true, email: true } } },
          },
          _count: { select: { enrollments: true, reviews: true, sections: true } },
        },
      }),
      prisma.course.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { courses, total, page, limit, totalPages };
  }

  async getPendingCoursesAdmin() {
    return await prisma.course.findMany({
      where: {
        status: { in: [CourseStatus.REVIEW, CourseStatus.DRAFT] },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        tutor: {
          include: { user: { select: { name: true, email: true } } },
        },
        _count: { select: { enrollments: true, reviews: true, sections: true } },
      },
    });
  }

  async updateCourseStatus(courseId: string, status: any, rejectionReason?: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { tutor: { include: { user: true } } },
    });

    if (!course) throw new AppError('Course not found.', StatusCodes.NOT_FOUND);

    // Map APPROVED to PUBLISHED for seamless publication
    const targetStatus = status === 'APPROVED' ? CourseStatus.PUBLISHED : (status as CourseStatus);

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        status: targetStatus,
        rejectionReason: targetStatus === CourseStatus.DRAFT ? rejectionReason : null,
      },
    });

    if (targetStatus === CourseStatus.PUBLISHED) {
      sendApprovalEmail(course.tutor.user.email, course.tutor.user.name, `Course: ${course.title}`).catch(() => {});
    }

    return updated;
  }

  async getAllPayoutsAdmin(query: any) {
    const { skip, take, page, limit } = parsePagination(query);
    const where: Prisma.PayoutWhereInput = {};
    if (query.status) where.status = query.status as PayoutStatus;

    const [payouts, total] = await Promise.all([
      prisma.payout.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          tutor: {
            include: { user: { select: { name: true, email: true } } },
          },
        },
      }),
      prisma.payout.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { payouts, total, page, limit, totalPages };
  }

  async processPayout(payoutId: string, status: PayoutStatus, notes?: string) {
    const payout = await prisma.payout.findUnique({
      where: { id: payoutId },
      include: { tutor: { include: { user: true } } },
    });

    if (!payout) throw new AppError('Payout record not found.', StatusCodes.NOT_FOUND);

    if (payout.status !== PayoutStatus.PENDING) {
      throw new AppError(`Only pending payouts can be processed. Current status is ${payout.status}.`, StatusCodes.BAD_REQUEST);
    }

    const updated = await prisma.payout.update({
      where: { id: payoutId },
      data: {
        status,
        notes,
        ...(status === PayoutStatus.PAID && { processedAt: new Date() }),
      },
    });

    if (status === PayoutStatus.PAID) {
      sendPayoutProcessed(payout.tutor.user.email, payout.tutor.user.name, payout.amount).catch(() => {});
    }

    return updated;
  }

  // ── 6. SITE CONFIGURATION SETTINGS ─────────────────────────

  async getSiteSettings() {
    const settings = await prisma.siteSettings.findMany();
    const settingsMap: Record<string, string> = {
      platformCommission: '20',
      minPayout: '500',
      maintenanceMode: 'false',
      featuredListingPrice: '4999',
    };

    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return settingsMap;
  }

  async updateSiteSetting(key: string, value: string) {
    return await prisma.siteSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  // ── 7. CMS WEBSITE CONTENT (LITE CMS) ─────────────────────

  async getWebsiteContent(section?: string) {
    const where: any = {};
    if (section) {
      where.key = `cms_${section}`;
    } else {
      where.key = { startsWith: 'cms_' };
    }
    const settings = await prisma.siteSettings.findMany({ where });
    const contentMap: Record<string, any> = {};
    settings.forEach((s) => {
      const cleanKey = s.key.replace(/^cms_/, '');
      try {
        contentMap[cleanKey] = JSON.parse(s.value);
      } catch {
        contentMap[cleanKey] = s.value;
      }
    });
    return contentMap;
  }

  async updateWebsiteContent(sectionKey: string, content: any) {
    const key = sectionKey.startsWith('cms_') ? sectionKey : `cms_${sectionKey}`;
    const value = typeof content === 'string' ? content : JSON.stringify(content);
    return await prisma.siteSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  // ── 9. AUDIT LOGS ──────────────────────────────────────────

  async createAuditLog(data: {
    actorId: string;
    action: string;
    targetType: string;
    targetId: string;
    metadata?: any;
  }) {
    return prisma.auditLog.create({
      data: {
        actorId: data.actorId,
        action: data.action,
        targetType: data.targetType,
        targetId: data.targetId,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : undefined,
      },
    });
  }

  async getAuditLogs(query: any) {
    const { page, limit, skip } = parsePagination(query);
    const where: any = {};
    if (query.action) where.action = query.action;
    if (query.targetType) where.targetType = query.targetType;
    if (query.actorId) where.actorId = query.actorId;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: { select: { id: true, name: true, email: true, role: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total, page, limit };
  }
}

export const adminService = new AdminService();
