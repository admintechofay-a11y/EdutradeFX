import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { parsePagination } from '../../utils/pagination.utils';
import { hashPassword, generateSecureToken, hashToken } from '../../utils/bcrypt.utils';
import {
  sendApprovalEmail,
  sendRejectionEmail,
  sendChangesRequestedEmail,
  sendPayoutProcessed,
  sendPasswordResetEmail,
} from '../../utils/email.utils';
import {
  ApprovalStatus,
  BrokerOnboardingStatus,
  OnboardingStatus,
  AgreementAudience,
  AgreementKind,
  AmEntityType,
  CourseStatus,
  NotificationType,
  OrderStatus,
  PayoutStatus,
  Prisma,
  Role,
  StatementAccountType,
  SpSubscriptionModel,
  SpUpdateFrequency,
  SpPlanPeriod,
} from '@prisma/client';
import { decryptBrokerCredential } from '../../utils/crypto.utils';
import { generateSignedDocumentUrl } from '../../utils/cloudinary.utils';
import { computeSPReviewFlags } from '../signal-providers/sp.utils';

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

  async getBrokerByIdAdmin(brokerId: string) {
    const broker = await prisma.broker.findUnique({
      where: { id: brokerId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
        licenses: { orderBy: { sortOrder: 'asc' } },
        servers: { orderBy: { sortOrder: 'asc' } },
        boardMembers: { orderBy: { sortOrder: 'asc' } },
        accountGroups: {
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            name: true,
            demoAvailable: true,
            currency: true,
            currencyCode: true,
            currencyOther: true,
            spreadTypesLabel: true,
            spreadFrom: true,
            minDeposit: true,
            depositBonusPctUpTo: true,
            depositBonusCode: true,
            depositBonusNum: true,
            leverageUpTo: true,
            leverageCode: true,
            leverageNum: true,
            minTradeVolume: true,
            hasCommissionPerLot: true,
            feesPerLot: true,
            commissionStructureUrl: true,
            spreadType: true,
            orderTypes: true,
            swapFree: true,
            swapLong: true,
            swapShort: true,
            orderExecution: true,
            gtcMode: true,
            eaAllowed: true,
            hedgingAllowed: true,
            nettingAllowed: true,
            scalpingAllowed: true,
            hasSwapCharges: true,
            swapStructureUrl: true,
            slippage: true,
            slippagePoints: true,
            markups: true,
            forexCommission: true,
            cryptoCommission: true,
            commoditiesCommission: true,
            metalsCommission: true,
            indexCommission: true,
            stocksCommission: true,
            testLogin: true,
            testServer: true,
            sortOrder: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        ibPlans: { orderBy: { sortOrder: 'asc' } },
        depositMethodItems: { orderBy: { sortOrder: 'asc' } },
        withdrawalMethodItems: { orderBy: { sortOrder: 'asc' } },
        symbolSpecs: { orderBy: { sortOrder: 'asc' } },
        fundingYears: { orderBy: { sortOrder: 'asc' } },
        clientActivity: true,
        businessAreas: {
          select: {
            id: true,
            brokerId: true,
            regionCode: true,
            countryOrRegion: true,
            sortOrder: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        awards: { orderBy: { sortOrder: 'asc' } },
        documents: { orderBy: { createdAt: 'desc' } },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
        leads: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!broker) {
      throw new AppError('Broker profile not found.', StatusCodes.NOT_FOUND);
    }

    return broker;
  }

  async verifyBrokerLicense(brokerId: string, licenseId: string, verified: boolean) {
    const license = await prisma.brokerLicense.findFirst({
      where: { id: licenseId, brokerId },
    });
    if (!license) {
      throw new AppError('Broker license not found.', StatusCodes.NOT_FOUND);
    }

    return await prisma.brokerLicense.update({
      where: { id: licenseId },
      data: { verifiedByAdmin: verified },
    });
  }

  async revealBrokerAccountCredentials(brokerId: string, accountGroupId: string, adminUserId: string) {
    const group = await prisma.brokerAccountGroup.findFirst({
      where: { id: accountGroupId, brokerId },
      select: {
        id: true,
        name: true,
        testLogin: true,
        testServer: true,
        testPasswordEnc: true,
      },
    });

    if (!group) {
      throw new AppError('Broker account group not found.', StatusCodes.NOT_FOUND);
    }

    let plaintextPassword = '';
    if (group.testPasswordEnc) {
      try {
        plaintextPassword = decryptBrokerCredential(group.testPasswordEnc);
      } catch {
        plaintextPassword = 'DECRYPTION_ERROR';
      }
    }

    await prisma.auditLog.create({
      data: {
        actorId: adminUserId,
        action: 'REVEAL_TEST_CREDENTIALS',
        targetType: 'BROKER_ACCOUNT_GROUP',
        targetId: accountGroupId,
        metadata: { brokerId, groupName: group.name },
      },
    });

    return {
      accountGroupId: group.id,
      name: group.name,
      testLogin: group.testLogin || null,
      testServer: group.testServer || null,
      testPassword: plaintextPassword,
    };
  }

  async updateBrokerStatus(
    brokerId: string,
    status: ApprovalStatus,
    rejectionReason?: string,
    reviewNote?: string,
    onboardingStatus?: BrokerOnboardingStatus
  ) {
    const broker = await prisma.broker.findUnique({
      where: { id: brokerId },
      include: { user: true },
    });

    if (!broker) throw new AppError('Broker not found.', StatusCodes.NOT_FOUND);

    let targetOnboardingStatus = onboardingStatus;
    if (!targetOnboardingStatus) {
      if (status === ApprovalStatus.APPROVED) {
        targetOnboardingStatus = BrokerOnboardingStatus.VERIFIED;
      } else if (status === ApprovalStatus.PENDING && reviewNote) {
        targetOnboardingStatus = BrokerOnboardingStatus.CHANGES_REQUESTED;
      }
    }

    const updated = await prisma.broker.update({
      where: { id: brokerId },
      data: {
        status,
        ...(targetOnboardingStatus ? { onboardingStatus: targetOnboardingStatus } : {}),
        ...(rejectionReason !== undefined ? { rejectionReason } : {}),
        ...(reviewNote !== undefined ? { reviewNote } : {}),
      },
    });

    // In-app notification
    let notifTitle = 'Broker Application Update';
    let notifMessage = `Your broker account status was updated to ${status}.`;
    if (status === ApprovalStatus.APPROVED) {
      notifTitle = 'Broker Application Approved!';
      notifMessage = 'Congratulations! Your broker profile has been verified and published on EdutradeFX.';
    } else if (targetOnboardingStatus === BrokerOnboardingStatus.CHANGES_REQUESTED) {
      notifTitle = 'Action Required: Changes Requested on Broker Profile';
      notifMessage = reviewNote || 'Compliance audit requested modifications before your profile can be approved.';
    } else if (status === ApprovalStatus.REJECTED) {
      notifTitle = 'Broker Application Rejected';
      notifMessage = rejectionReason || 'Your broker profile application did not meet compliance requirements.';
    }

    await prisma.notification.create({
      data: {
        userId: broker.userId,
        type:
          status === ApprovalStatus.APPROVED
            ? NotificationType.APPROVAL
            : status === ApprovalStatus.REJECTED
            ? NotificationType.REJECTION
            : NotificationType.WARNING,
        title: notifTitle,
        message: notifMessage,
        link: '/dashboard/broker/onboarding',
      },
    }).catch(() => {});

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
    if (query.onboardingStatus) where.onboardingStatus = query.onboardingStatus as OnboardingStatus;
    if (query.regulated === 'true') where.isRegulated = true;
    if (query.regulatoryVerified === 'true') where.regulatoryVerified = true;

    if (query.search || query.q) {
      const term = (query.search || query.q) as string;
      where.OR = [
        { fullName: { contains: term, mode: 'insensitive' } },
        { bio: { contains: term, mode: 'insensitive' } },
        { user: { email: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const [accountManagers, total] = await Promise.all([
      prisma.accountManager.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          _count: { select: { reviews: true, enquiries: true, documents: true } },
        },
      }),
      prisma.accountManager.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { accountManagers, total, page, limit, totalPages };
  }

  async getAMByIdAdmin(amId: string) {
    const am = await prisma.accountManager.findUnique({
      where: { id: amId },
      include: {
        user: { select: { id: true, name: true, email: true, createdAt: true } },
        documents: { orderBy: { createdAt: 'desc' } },
        agreementAcceptances: { orderBy: { acceptedAt: 'desc' } },
        reviews: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
        enquiries: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!am) {
      throw new AppError('Account manager not found.', StatusCodes.NOT_FOUND);
    }

    // Fetch related audit logs
    const auditLogs = await prisma.auditLog.findMany({
      where: { targetId: amId, targetType: 'ACCOUNT_MANAGER' },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return { ...am, auditLogs };
  }

  async getAMDocumentSignedUrl(amId: string, docId: string, adminUserId: string) {
    const doc = await prisma.accountManagerDocument.findFirst({
      where: { id: docId, accountManagerId: amId },
    });

    if (!doc) {
      throw new AppError('Document not found.', StatusCodes.NOT_FOUND);
    }

    if (!doc.publicId) {
      // If no Cloudinary publicId, return direct fileUrl
      return { url: doc.fileUrl, expiresInSeconds: 300 };
    }

    const isImage = doc.docType === 'PAST_RESULT_SCREENSHOT';
    const signedUrl = generateSignedDocumentUrl(doc.publicId, isImage ? 'image' : 'raw', 300);

    // Audit log the signed URL generation
    await prisma.auditLog.create({
      data: {
        actorId: adminUserId,
        action: 'ACCESS_AM_DOCUMENT_URL',
        targetType: 'ACCOUNT_MANAGER_DOCUMENT',
        targetId: docId,
        metadata: { amId, docType: doc.docType, fileName: doc.fileName },
      },
    });

    return { url: signedUrl, expiresInSeconds: 300 };
  }

  async updateAMStatus(amId: string, status: ApprovalStatus, reason?: string, adminUserId?: string) {
    const am = await prisma.accountManager.findUnique({
      where: { id: amId },
      include: { user: true },
    });
    if (!am) throw new AppError('Account manager not found.', StatusCodes.NOT_FOUND);

    if (status === ApprovalStatus.REJECTED && (!reason || !reason.trim())) {
      throw new AppError('A rejection reason is required when rejecting an Account Manager application.', StatusCodes.BAD_REQUEST);
    }

    const updated = await prisma.accountManager.update({
      where: { id: amId },
      data: {
        status,
        rejectionReason: status === ApprovalStatus.REJECTED ? reason?.trim() : null,
        reviewedById: adminUserId || null,
        reviewedAt: new Date(),
      },
    });

    // Send in-app notification
    await prisma.notification.create({
      data: {
        userId: am.userId,
        type: status === ApprovalStatus.APPROVED ? NotificationType.APPROVAL : NotificationType.REJECTION,
        title: status === ApprovalStatus.APPROVED ? 'Account Manager Profile Approved!' : 'Account Manager Application Update',
        message: status === ApprovalStatus.APPROVED
          ? 'Your Account Manager profile has been approved and is now publicly listed on EdutradeFX.'
          : `Your application was rejected: ${reason}`,
        link: '/dashboard/account-manager',
      },
    }).catch(() => {});

    // Send email safely
    if (status === ApprovalStatus.APPROVED) {
      sendApprovalEmail(am.user.email, am.user.name, 'Account Manager Profile').catch(() => {});
    } else if (status === ApprovalStatus.REJECTED) {
      sendRejectionEmail(am.user.email, am.user.name, 'Account Manager Profile', reason).catch(() => {});
    }

    return updated;
  }

  async requestAMChanges(amId: string, note: string, adminUserId?: string) {
    const am = await prisma.accountManager.findUnique({
      where: { id: amId },
      include: { user: true },
    });
    if (!am) throw new AppError('Account manager not found.', StatusCodes.NOT_FOUND);

    if (!note || !note.trim()) {
      throw new AppError('A detailed note is required when requesting changes.', StatusCodes.BAD_REQUEST);
    }

    const updated = await prisma.accountManager.update({
      where: { id: amId },
      data: {
        onboardingStatus: OnboardingStatus.CHANGES_REQUESTED,
        changesRequestedNote: note.trim(),
        reviewedById: adminUserId || null,
        reviewedAt: new Date(),
      },
    });

    // Send notification
    await prisma.notification.create({
      data: {
        userId: am.userId,
        type: NotificationType.WARNING,
        title: 'Action Required: Information Update Requested',
        message: `Admin requested changes on your Account Manager application: ${note.trim()}`,
        link: '/dashboard/account-manager/onboarding',
      },
    }).catch(() => {});

    // Send email
    sendChangesRequestedEmail(am.user.email, am.user.name, 'Account Manager', note.trim()).catch(() => {});

    return updated;
  }

  async toggleAMRegulatoryVerified(amId: string, regulatoryVerified: boolean) {
    const am = await prisma.accountManager.findUnique({ where: { id: amId } });
    if (!am) throw new AppError('Account manager not found.', StatusCodes.NOT_FOUND);

    return prisma.accountManager.update({
      where: { id: amId },
      data: { regulatoryVerified: Boolean(regulatoryVerified) },
    });
  }

  async updateAMDocument(
    amId: string,
    docId: string,
    data: { isPublic?: boolean; reviewStatus?: ApprovalStatus; caption?: string; periodNote?: string }
  ) {
    const doc = await prisma.accountManagerDocument.findFirst({
      where: { id: docId, accountManagerId: amId },
    });
    if (!doc) throw new AppError('Document not found.', StatusCodes.NOT_FOUND);

    return prisma.accountManagerDocument.update({
      where: { id: doc.id },
      data: {
        ...(data.isPublic !== undefined ? { isPublic: data.isPublic } : {}),
        ...(data.reviewStatus ? { reviewStatus: data.reviewStatus } : {}),
        ...(data.caption !== undefined ? { caption: data.caption } : {}),
        ...(data.periodNote !== undefined ? { periodNote: data.periodNote } : {}),
      },
    });
  }

  async getAllAMAgreementsAdmin() {
    return prisma.partnerAgreement.findMany({
      where: { audience: AgreementAudience.ACCOUNT_MANAGER },
      orderBy: { id: 'asc' },
    });
  }

  async updateAMAgreementAdmin(
    key: string,
    data: { title?: string; body: string; isActive?: boolean },
    adminUserId?: string
  ) {
    const agreement = await prisma.partnerAgreement.findUnique({
      where: {
        audience_key: {
          audience: AgreementAudience.ACCOUNT_MANAGER,
          key,
        },
      },
    });
    if (!agreement) throw new AppError('Agreement not found.', StatusCodes.NOT_FOUND);

    const isBodyChanged = data.body && data.body.trim() !== agreement.body.trim();
    const newVersion = isBodyChanged ? agreement.version + 1 : agreement.version;

    return prisma.partnerAgreement.update({
      where: {
        audience_key: {
          audience: AgreementAudience.ACCOUNT_MANAGER,
          key,
        },
      },
      data: {
        ...(data.title ? { title: data.title.trim() } : {}),
        body: data.body.trim(),
        version: newVersion,
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        updatedById: adminUserId || null,
        updatedAt: new Date(),
      },
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
        entityType: data.entityType || AmEntityType.INDIVIDUAL,
        photo: data.photo || null,
        tagline: data.tagline || null,
        bio: data.bio || null,
        speciality: data.speciality || null,
        country: data.country || null,
        countryCode: data.countryCode || null,
        stateRegion: data.stateRegion || null,
        stateCode: data.stateCode || null,
        city: data.city || null,
        zipCode: data.zipCode || null,
        contactEmail: data.contactEmail || null,
        contactPhone: data.contactPhone || null,
        yearsExperience: data.yearsExperience ? parseInt(data.yearsExperience, 10) : null,
        tradingStyles: Array.isArray(data.tradingStyles) ? data.tradingStyles : [],
        preferredInstruments: Array.isArray(data.preferredInstruments) ? data.preferredInstruments : [],
        preferredPlatforms: Array.isArray(data.preferredPlatforms) ? data.preferredPlatforms : [],
        preferredBrokerTypes: Array.isArray(data.preferredBrokerTypes) ? data.preferredBrokerTypes : [],
        riskTolerance: data.riskTolerance || null,
        riskRewardRatio: data.riskRewardRatio || null,
        riskRewardValue: data.riskRewardValue ? parseFloat(data.riskRewardValue) : null,
        settlementCycle: data.settlementCycle || null,
        profitSharingPercent: data.profitSharingPercent ? parseFloat(data.profitSharingPercent) : null,
        lossSharingPercent: data.lossSharingPercent ? parseFloat(data.lossSharingPercent) : null,
        isRegulated: Boolean(data.isRegulated),
        regulatoryVerified: Boolean(data.regulatoryVerified),
        status: data.status || ApprovalStatus.APPROVED,
        onboardingStatus: data.onboardingStatus || OnboardingStatus.SUBMITTED,
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
        speciality: data.speciality !== undefined ? data.speciality : am.speciality,
        country: data.country !== undefined ? data.country : am.country,
        countryCode: data.countryCode !== undefined ? data.countryCode : am.countryCode,
        stateRegion: data.stateRegion !== undefined ? data.stateRegion : am.stateRegion,
        stateCode: data.stateCode !== undefined ? data.stateCode : am.stateCode,
        city: data.city !== undefined ? data.city : am.city,
        zipCode: data.zipCode !== undefined ? data.zipCode : am.zipCode,
        contactEmail: data.contactEmail !== undefined ? data.contactEmail : am.contactEmail,
        contactPhone: data.contactPhone !== undefined ? data.contactPhone : am.contactPhone,
        yearsExperience: data.yearsExperience !== undefined ? (data.yearsExperience ? parseInt(data.yearsExperience, 10) : null) : am.yearsExperience,
        tradingStyles: data.tradingStyles !== undefined ? data.tradingStyles : am.tradingStyles,
        preferredInstruments: data.preferredInstruments !== undefined ? data.preferredInstruments : am.preferredInstruments,
        preferredPlatforms: data.preferredPlatforms !== undefined ? data.preferredPlatforms : am.preferredPlatforms,
        preferredBrokerTypes: data.preferredBrokerTypes !== undefined ? data.preferredBrokerTypes : am.preferredBrokerTypes,
        riskTolerance: data.riskTolerance !== undefined ? data.riskTolerance : am.riskTolerance,
        riskRewardRatio: data.riskRewardRatio !== undefined ? data.riskRewardRatio : am.riskRewardRatio,
        riskRewardValue: data.riskRewardValue !== undefined ? (data.riskRewardValue ? parseFloat(data.riskRewardValue) : null) : am.riskRewardValue,
        settlementCycle: data.settlementCycle !== undefined ? data.settlementCycle : am.settlementCycle,
        profitSharingPercent: data.profitSharingPercent !== undefined ? (data.profitSharingPercent ? parseFloat(data.profitSharingPercent) : null) : am.profitSharingPercent,
        lossSharingPercent: data.lossSharingPercent !== undefined ? (data.lossSharingPercent ? parseFloat(data.lossSharingPercent) : null) : am.lossSharingPercent,
        isRegulated: data.isRegulated !== undefined ? Boolean(data.isRegulated) : am.isRegulated,
        regulatoryVerified: data.regulatoryVerified !== undefined ? Boolean(data.regulatoryVerified) : am.regulatoryVerified,
        status: data.status !== undefined ? data.status : am.status,
        onboardingStatus: data.onboardingStatus !== undefined ? data.onboardingStatus : am.onboardingStatus,
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
    if (query.onboardingStatus) where.onboardingStatus = query.onboardingStatus as OnboardingStatus;
    if (query.verificationStatus !== undefined) where.verificationStatus = query.verificationStatus === 'true';

    if (query.q || query.search) {
      const term = (query.q || query.search) as string;
      where.OR = [
        { displayName: { contains: term, mode: 'insensitive' } },
        { legalFullName: { contains: term, mode: 'insensitive' } },
        { strategy: { contains: term, mode: 'insensitive' } },
        { user: { email: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const [signalProviders, total] = await Promise.all([
      prisma.signalProvider.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          documents: { select: { id: true, docType: true, reviewStatus: true, fileName: true, createdAt: true } },
          plans: true,
          _count: { select: { signals: true, reviews: true, enquiries: true } },
        },
      }),
      prisma.signalProvider.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { signalProviders, total, page, limit, totalPages };
  }

  async getSPByIdAdmin(spId: string) {
    const sp = await prisma.signalProvider.findUnique({
      where: { id: spId },
      include: {
        user: { select: { id: true, name: true, email: true, createdAt: true } },
        documents: { orderBy: { createdAt: 'desc' } },
        plans: { orderBy: { sortOrder: 'asc' } },
        agreementAcceptances: { orderBy: { acceptedAt: 'desc' } },
        signals: { orderBy: { createdAt: 'desc' }, take: 20 },
        reviews: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
        enquiries: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!sp) {
      throw new AppError('Signal Provider not found.', StatusCodes.NOT_FOUND);
    }

    // Compute fresh review flags if not stored
    const flags = sp.reviewFlags || computeSPReviewFlags(sp);

    // Fetch related audit logs
    const auditLogs = await prisma.auditLog.findMany({
      where: { targetId: spId, targetType: 'SIGNAL_PROVIDER' },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return { ...sp, reviewFlags: flags, auditLogs };
  }

  async getSPDocumentSignedUrl(spId: string, docId: string, adminUserId: string) {
    const doc = await prisma.signalProviderDocument.findFirst({
      where: { id: docId, signalProviderId: spId },
    });

    if (!doc) {
      throw new AppError('Document not found.', StatusCodes.NOT_FOUND);
    }

    if (!doc.publicId) {
      return { url: doc.fileUrl, expiresInSeconds: 300 };
    }

    const isImage = ['.jpg', '.jpeg', '.png', '.webp'].some((ext) => doc.fileName.toLowerCase().endsWith(ext));
    const signedUrl = generateSignedDocumentUrl(doc.publicId, isImage ? 'image' : 'raw', 300);

    // Audit log the signed URL generation
    await prisma.auditLog.create({
      data: {
        actorId: adminUserId,
        action: 'ACCESS_SP_DOCUMENT_URL',
        targetType: 'SIGNAL_PROVIDER_DOCUMENT',
        targetId: docId,
        metadata: { spId, docType: doc.docType, fileName: doc.fileName },
      },
    });

    return { url: signedUrl, expiresInSeconds: 300 };
  }

  async updateSPStatus(spId: string, status: ApprovalStatus, reason?: string, adminUserId?: string) {
    const sp = await prisma.signalProvider.findUnique({
      where: { id: spId },
      include: { user: true },
    });
    if (!sp) throw new AppError('Signal Provider not found.', StatusCodes.NOT_FOUND);

    if (status === ApprovalStatus.REJECTED && (!reason || !reason.trim())) {
      throw new AppError('A rejection reason is required when rejecting a Signal Provider application.', StatusCodes.BAD_REQUEST);
    }

    let snapshotUpdate: Record<string, any> = {};
    if (status === ApprovalStatus.APPROVED) {
      const { serializePublicSP } = await import('../signal-providers/sp.serializer');
      snapshotUpdate = {
        publicSnapshot: serializePublicSP(sp),
      };
    }

    const updated = await prisma.signalProvider.update({
      where: { id: spId },
      data: {
        status,
        rejectionReason: status === ApprovalStatus.REJECTED ? reason?.trim() : null,
        reviewedById: adminUserId || null,
        reviewedAt: new Date(),
        ...snapshotUpdate,
      },
    });

    // In-app notification
    await prisma.notification.create({
      data: {
        userId: sp.userId,
        type: status === ApprovalStatus.APPROVED ? NotificationType.APPROVAL : NotificationType.REJECTION,
        title: status === ApprovalStatus.APPROVED ? 'Signal Provider Profile Approved!' : 'Signal Provider Application Update',
        message: status === ApprovalStatus.APPROVED
          ? 'Your Signal Provider profile has been approved and is now publicly listed on EdutradeFX.'
          : `Your application was rejected: ${reason}`,
        link: '/dashboard/signal-provider',
      },
    }).catch(() => {});

    // Safe email dispatch
    if (status === ApprovalStatus.APPROVED) {
      sendApprovalEmail(sp.user.email, sp.user.name, 'Signal Provider Profile').catch(() => {});
    } else if (status === ApprovalStatus.REJECTED) {
      sendRejectionEmail(sp.user.email, sp.user.name, 'Signal Provider Profile', reason).catch(() => {});
    }

    await prisma.auditLog.create({
      data: {
        actorId: adminUserId || sp.userId,
        action: `SP_STATUS_${status}`,
        targetType: 'SIGNAL_PROVIDER',
        targetId: spId,
        metadata: { previousStatus: sp.status, newStatus: status, reason },
      },
    }).catch(() => {});

    return updated;
  }

  async requestSPChanges(spId: string, note: string, adminUserId?: string) {
    const sp = await prisma.signalProvider.findUnique({
      where: { id: spId },
      include: { user: true },
    });
    if (!sp) throw new AppError('Signal Provider not found.', StatusCodes.NOT_FOUND);

    if (!note || !note.trim()) {
      throw new AppError('A detailed note is required when requesting changes.', StatusCodes.BAD_REQUEST);
    }

    const updated = await prisma.signalProvider.update({
      where: { id: spId },
      data: {
        onboardingStatus: OnboardingStatus.CHANGES_REQUESTED,
        changesRequestedNote: note.trim(),
        reviewedById: adminUserId || null,
        reviewedAt: new Date(),
      },
    });

    await prisma.notification.create({
      data: {
        userId: sp.userId,
        type: NotificationType.WARNING,
        title: 'Changes Requested on Signal Provider Profile',
        message: `EdutradeFX compliance requested changes to your Signal Provider profile: ${note.trim()}`,
        link: '/dashboard/signal-provider/onboarding',
      },
    }).catch(() => {});

    sendChangesRequestedEmail(sp.user.email, sp.user.name, 'Signal Provider Profile', note.trim()).catch(() => {});

    await prisma.auditLog.create({
      data: {
        actorId: adminUserId || sp.userId,
        action: 'REQUEST_SP_CHANGES',
        targetType: 'SIGNAL_PROVIDER',
        targetId: spId,
        metadata: { note: note.trim() },
      },
    }).catch(() => {});

    return updated;
  }

  async updateSPVerification(
    spId: string,
    data: { idVerified?: boolean; statementVerified?: boolean; performanceLinkVerified?: boolean },
    adminUserId?: string
  ) {
    const sp = await prisma.signalProvider.findUnique({ where: { id: spId } });
    if (!sp) throw new AppError('Signal Provider not found.', StatusCodes.NOT_FOUND);

    const idVerified = data.idVerified !== undefined ? Boolean(data.idVerified) : sp.idVerified;
    const statementVerified = data.statementVerified !== undefined ? Boolean(data.statementVerified) : sp.statementVerified;
    const performanceLinkVerified = data.performanceLinkVerified !== undefined ? Boolean(data.performanceLinkVerified) : sp.performanceLinkVerified;

    // Spec 4.2: verificationStatus is set ONLY when idVerified && statementVerified && statementAccountType = LIVE
    const newVerificationStatus = Boolean(
      idVerified && statementVerified && sp.statementAccountType === StatementAccountType.LIVE
    );

    const updated = await prisma.signalProvider.update({
      where: { id: spId },
      data: {
        idVerified,
        statementVerified,
        performanceLinkVerified,
        verificationStatus: newVerificationStatus,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: adminUserId || sp.userId,
        action: 'UPDATE_SP_VERIFICATION',
        targetType: 'SIGNAL_PROVIDER',
        targetId: spId,
        metadata: {
          idVerified,
          statementVerified,
          performanceLinkVerified,
          verificationStatus: newVerificationStatus,
        },
      },
    }).catch(() => {});

    return updated;
  }

  async updateSPDocument(
    spId: string,
    docId: string,
    data: { reviewStatus: ApprovalStatus; reviewNote?: string },
    adminUserId?: string
  ) {
    const doc = await prisma.signalProviderDocument.findFirst({
      where: { id: docId, signalProviderId: spId },
    });
    if (!doc) throw new AppError('Document not found.', StatusCodes.NOT_FOUND);

    const updated = await prisma.signalProviderDocument.update({
      where: { id: docId },
      data: {
        reviewStatus: data.reviewStatus,
        reviewNote: data.reviewNote ? data.reviewNote.trim() : null,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: adminUserId || 'system',
        action: 'REVIEW_SP_DOCUMENT',
        targetType: 'SIGNAL_PROVIDER_DOCUMENT',
        targetId: docId,
        metadata: { spId, reviewStatus: data.reviewStatus, reviewNote: data.reviewNote },
      },
    }).catch(() => {});

    return updated;
  }

  async getSPAgreements() {
    return await prisma.partnerAgreement.findMany({
      where: { audience: AgreementAudience.SIGNAL_PROVIDER },
      orderBy: { id: 'asc' },
    });
  }

  async updateSPAgreementAdmin(
    key: string,
    data: { title?: string; body: string; isActive?: boolean },
    adminUserId?: string
  ) {
    const agreement = await prisma.partnerAgreement.findUnique({
      where: {
        audience_key: {
          audience: AgreementAudience.SIGNAL_PROVIDER,
          key,
        },
      },
    });
    if (!agreement) throw new AppError('Agreement not found.', StatusCodes.NOT_FOUND);

    const isBodyChanged = data.body && data.body.trim() !== agreement.body.trim();
    const newVersion = isBodyChanged ? agreement.version + 1 : agreement.version;

    const updated = await prisma.partnerAgreement.update({
      where: {
        audience_key: {
          audience: AgreementAudience.SIGNAL_PROVIDER,
          key,
        },
      },
      data: {
        ...(data.title ? { title: data.title.trim() } : {}),
        body: data.body.trim(),
        version: newVersion,
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        updatedById: adminUserId || null,
        updatedAt: new Date(),
      },
    });

    if (isBodyChanged) {
      await prisma.auditLog.create({
        data: {
          actorId: adminUserId || 'system',
          action: 'BUMP_SP_AGREEMENT_VERSION',
          targetType: 'PARTNER_AGREEMENT',
          targetId: agreement.id,
          metadata: { key, oldVersion: agreement.version, newVersion },
        },
      }).catch(() => {});
    }

    return updated;
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
        legalFullName: data.legalFullName || null,
        contactPhone: data.contactPhone || null,
        residenceCountryCode: data.residenceCountryCode || null,
        residenceCountry: data.residenceCountry || null,
        slug,
        photo: data.photo || null,
        bio: data.bio || null,
        instruments: Array.isArray(data.instruments) ? data.instruments : (data.instruments ? String(data.instruments).split(',').map((s: string) => s.trim()) : ['EURUSD', 'GBPUSD']),
        tradingStyles: Array.isArray(data.tradingStyles) ? data.tradingStyles : [],
        tradingStyleDescription: data.tradingStyleDescription || null,
        yearsTrading: data.yearsTrading !== undefined ? parseInt(data.yearsTrading, 10) : null,
        strategy: data.strategy || null,
        strategyDetail: data.strategyDetail || null,
        riskCategory: data.riskCategory || null,
        declaredAvgMonthlyReturn: data.declaredAvgMonthlyReturn ? parseFloat(data.declaredAvgMonthlyReturn) : null,
        declaredMaxDrawdown: data.declaredMaxDrawdown ? parseFloat(data.declaredMaxDrawdown) : null,
        declaredWinRate: data.declaredWinRate ? parseFloat(data.declaredWinRate) : null,
        maxLeverageUsed: data.maxLeverageUsed ? parseInt(data.maxLeverageUsed, 10) : null,
        riskRewardPreference: data.riskRewardPreference || null,
        riskPhilosophy: data.riskPhilosophy || null,
        usesHedgingOrMartingale: Boolean(data.usesHedgingOrMartingale),
        usesHedging: Boolean(data.usesHedging),
        usesMartingale: Boolean(data.usesMartingale),
        hedgingMartingaleNotes: data.hedgingMartingaleNotes || null,
        subscriptionModel: data.subscriptionModel || SpSubscriptionModel.FREE,
        updateFrequency: data.updateFrequency || null,
        inquiryHandlingApproach: data.inquiryHandlingApproach || null,
        offersLiveQA: Boolean(data.offersLiveQA),
        liveQAFrequency: data.liveQAFrequency || null,
        website: data.website || null,
        telegramChannelUrl: data.telegramChannelUrl || null,
        verificationStatus: data.verificationStatus === true || data.verificationStatus === 'true',
        status: data.status || ApprovalStatus.APPROVED,
        onboardingStatus: data.onboardingStatus || OnboardingStatus.SUBMITTED,
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
        legalFullName: data.legalFullName !== undefined ? data.legalFullName : sp.legalFullName,
        contactPhone: data.contactPhone !== undefined ? data.contactPhone : sp.contactPhone,
        residenceCountryCode: data.residenceCountryCode !== undefined ? data.residenceCountryCode : sp.residenceCountryCode,
        residenceCountry: data.residenceCountry !== undefined ? data.residenceCountry : sp.residenceCountry,
        photo: data.photo !== undefined ? data.photo : sp.photo,
        bio: data.bio !== undefined ? data.bio : sp.bio,
        instruments: Array.isArray(data.instruments) ? data.instruments : (data.instruments !== undefined ? String(data.instruments).split(',').map((s: string) => s.trim()) : sp.instruments),
        tradingStyles: Array.isArray(data.tradingStyles) ? data.tradingStyles : sp.tradingStyles,
        tradingStyleDescription: data.tradingStyleDescription !== undefined ? data.tradingStyleDescription : sp.tradingStyleDescription,
        yearsTrading: data.yearsTrading !== undefined ? (data.yearsTrading ? parseInt(data.yearsTrading, 10) : null) : sp.yearsTrading,
        strategy: data.strategy !== undefined ? data.strategy : sp.strategy,
        strategyDetail: data.strategyDetail !== undefined ? data.strategyDetail : sp.strategyDetail,
        riskCategory: data.riskCategory !== undefined ? data.riskCategory : sp.riskCategory,
        declaredAvgMonthlyReturn: data.declaredAvgMonthlyReturn !== undefined ? (data.declaredAvgMonthlyReturn ? parseFloat(data.declaredAvgMonthlyReturn) : null) : sp.declaredAvgMonthlyReturn,
        declaredMaxDrawdown: data.declaredMaxDrawdown !== undefined ? (data.declaredMaxDrawdown ? parseFloat(data.declaredMaxDrawdown) : null) : sp.declaredMaxDrawdown,
        declaredWinRate: data.declaredWinRate !== undefined ? (data.declaredWinRate ? parseFloat(data.declaredWinRate) : null) : sp.declaredWinRate,
        maxLeverageUsed: data.maxLeverageUsed !== undefined ? (data.maxLeverageUsed ? parseInt(data.maxLeverageUsed, 10) : null) : sp.maxLeverageUsed,
        riskRewardPreference: data.riskRewardPreference !== undefined ? data.riskRewardPreference : sp.riskRewardPreference,
        riskPhilosophy: data.riskPhilosophy !== undefined ? data.riskPhilosophy : sp.riskPhilosophy,
        usesHedgingOrMartingale: data.usesHedgingOrMartingale !== undefined ? Boolean(data.usesHedgingOrMartingale) : sp.usesHedgingOrMartingale,
        usesHedging: data.usesHedging !== undefined ? Boolean(data.usesHedging) : sp.usesHedging,
        usesMartingale: data.usesMartingale !== undefined ? Boolean(data.usesMartingale) : sp.usesMartingale,
        hedgingMartingaleNotes: data.hedgingMartingaleNotes !== undefined ? data.hedgingMartingaleNotes : sp.hedgingMartingaleNotes,
        subscriptionModel: data.subscriptionModel !== undefined ? data.subscriptionModel : sp.subscriptionModel,
        updateFrequency: data.updateFrequency !== undefined ? data.updateFrequency : sp.updateFrequency,
        inquiryHandlingApproach: data.inquiryHandlingApproach !== undefined ? data.inquiryHandlingApproach : sp.inquiryHandlingApproach,
        offersLiveQA: data.offersLiveQA !== undefined ? Boolean(data.offersLiveQA) : sp.offersLiveQA,
        liveQAFrequency: data.liveQAFrequency !== undefined ? data.liveQAFrequency : sp.liveQAFrequency,
        website: data.website !== undefined ? data.website : sp.website,
        telegramChannelUrl: data.telegramChannelUrl !== undefined ? data.telegramChannelUrl : sp.telegramChannelUrl,
        verificationStatus: data.verificationStatus !== undefined ? Boolean(data.verificationStatus) : sp.verificationStatus,
        status: data.status !== undefined ? data.status : sp.status,
        onboardingStatus: data.onboardingStatus !== undefined ? data.onboardingStatus : sp.onboardingStatus,
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

  // ── BROKER LEADS (B29) ──────────────────────────────
  async getBrokerLeads(query: any) {
    const { page, limit, skip } = parsePagination(query);
    const where: Prisma.BrokerLeadWhereInput = {};

    if (query.brokerId) {
      where.brokerId = query.brokerId;
    }

    if (query.isRead !== undefined && query.isRead !== '') {
      where.isRead = query.isRead === 'true' || query.isRead === true;
    }

    if (query.search) {
      const s = String(query.search).trim();
      where.OR = [
        { name: { contains: s, mode: 'insensitive' } },
        { email: { contains: s, mode: 'insensitive' } },
        { phone: { contains: s, mode: 'insensitive' } },
        { message: { contains: s, mode: 'insensitive' } },
        { broker: { companyName: { contains: s, mode: 'insensitive' } } },
      ];
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const [leads, total] = await Promise.all([
      prisma.brokerLead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          broker: {
            select: { id: true, companyName: true, slug: true, logo: true },
          },
        },
      }),
      prisma.brokerLead.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { leads, total, page, limit, totalPages };
  }

  async markBrokerLeadRead(id: string, isRead = true) {
    const lead = await prisma.brokerLead.findUnique({ where: { id } });
    if (!lead) throw new AppError('Broker lead not found', StatusCodes.NOT_FOUND);

    const updated = await prisma.brokerLead.update({
      where: { id },
      data: {
        isRead,
        readAt: isRead ? new Date() : null,
      },
      include: {
        broker: {
          select: { id: true, companyName: true, slug: true, logo: true },
        },
      },
    });

    return updated;
  }

  async deleteBrokerLead(id: string) {
    const lead = await prisma.brokerLead.findUnique({ where: { id } });
    if (!lead) throw new AppError('Broker lead not found', StatusCodes.NOT_FOUND);

    await prisma.brokerLead.delete({ where: { id } });
    return { success: true, message: 'Broker lead deleted successfully' };
  }
}

export const adminService = new AdminService();
