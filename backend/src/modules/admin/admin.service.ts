import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { parsePagination } from '../../utils/pagination.utils';
import { hashPassword, generateSecureToken } from '../../utils/bcrypt.utils';
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

  async deleteUser(id: string) {
    await prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully.' };
  }

  async resetUserPassword(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError('User not found.', StatusCodes.NOT_FOUND);

    const rawToken = generateSecureToken();
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id },
      data: { resetToken: rawToken, resetTokenExpiry: expiry },
    });

    sendPasswordResetEmail(user.email, user.name, rawToken).catch(() => {});
    return { message: 'Password reset dispatch sent to user email.' };
  }

  // ── 3. BROKER COMPLIANCE & REVIEWS ─────────────────────────

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

  async updateCourseStatus(courseId: string, status: CourseStatus, rejectionReason?: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { tutor: { include: { user: true } } },
    });

    if (!course) throw new AppError('Course not found.', StatusCodes.NOT_FOUND);

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        status,
        rejectionReason: status === CourseStatus.DRAFT ? rejectionReason : null,
      },
    });

    if (status === CourseStatus.PUBLISHED) {
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
