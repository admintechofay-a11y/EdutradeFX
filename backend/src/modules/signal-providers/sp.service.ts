import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { generateUniqueSlug } from '../../utils/slug.utils';
import { parsePagination } from '../../utils/pagination.utils';
import {
  ApprovalStatus,
  OnboardingStatus,
  SpUpdateFrequency,
  SpSubscriptionModel,
  SpPlanPeriod,
  StatementAccountType,
  AgreementAudience,
  EnquiryTargetType,
  NotificationType,
  Prisma,
  Role,
  SignalDirection,
  SignalStatus,
} from '@prisma/client';
import { transporter } from '../../config/email';
import { serializePublicSP } from './sp.serializer';
import {
  personalSchema,
  experienceBaseSchema,
  experienceSchema,
  performanceSchema,
  riskBaseSchema,
  riskSchema,
  verificationBaseSchema,
  verificationSchema,
  additionalSchema,
  communicationBaseSchema,
  communicationSchema,
  pricingBaseSchema,
  pricingSchema,
  acceptAgreementsSchema,
  spSubmitSchema,
  detectPerformancePlatform,
} from './sp.schemas';
import {
  calculateSPCompletion,
  computeSPReviewFlags,
  ALL_SP_AGREEMENT_KEYS,
} from './sp.utils';
import { verifyDocumentMagicBytes } from '../../middleware/upload.middleware';
import {
  uploadBufferToCloudinary,
  deleteCloudinaryAsset,
} from '../../utils/cloudinary.utils';

// Helper to determine whether an updated field on an APPROVED provider triggers a re-review
const SENSITIVE_RE_REVIEW_FIELDS = [
  'legalFullName',
  'instruments',
  'tradingStyles',
  'tradingStyleDescription',
  'strategy',
  'strategyDetail',
  'riskCategory',
  'declaredAvgMonthlyReturn',
  'declaredMaxDrawdown',
  'declaredWinRate',
  'maxLeverageUsed',
  'riskRewardPreference',
  'usesHedgingOrMartingale',
  'usesMartingale',
  'subscriptionModel',
];

export class SignalProviderService {
  /**
   * Helper to ensure an official provider profile exists for an admin
   */
  async ensureOfficialProvider(adminUserId: string) {
    let sp = await prisma.signalProvider.findUnique({ where: { userId: adminUserId } });
    if (!sp) {
      sp = await prisma.signalProvider.create({
        data: {
          userId: adminUserId,
          displayName: 'EdutradeFX Official Signals',
          legalFullName: 'EdutradeFX Operations Ltd',
          slug: `official-signals-${Date.now().toString().slice(-4)}`,
          status: ApprovalStatus.APPROVED,
          onboardingStatus: OnboardingStatus.SUBMITTED,
          verificationStatus: true,
          idVerified: true,
          statementVerified: true,
          statementAccountType: StatementAccountType.LIVE,
          isFeatured: true,
          instruments: ['EURUSD', 'GBPUSD', 'XAUUSD', 'USDJPY'],
          tradingStyles: ['DAY_TRADER', 'SWING_TRADER'],
          strategy: 'Institutional Order Flow',
          strategyDetail: 'Official platform signal desk focusing on algorithmic liquidity levels and multi-session swing setups.',
          riskCategory: 'MEDIUM',
          subscriptionModel: SpSubscriptionModel.FREE,
          completionPercent: 100,
        },
      });
    }
    return sp;
  }

  /**
   * Public directory search with rich multi-criteria filters
   */
  async getSignalProviders(query: any) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.SignalProviderWhereInput = {
      status: ApprovalStatus.APPROVED,
    };

    if (query.q || query.search) {
      const term = (query.q || query.search) as string;
      where.OR = [
        { displayName: { contains: term, mode: 'insensitive' } },
        { bio: { contains: term, mode: 'insensitive' } },
        { strategy: { contains: term, mode: 'insensitive' } },
        { strategyDetail: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (query.instrument) {
      where.instruments = { has: query.instrument as string };
    }

    if (query.style) {
      where.tradingStyles = { has: query.style as string };
    }

    if (query.timeframe) {
      where.preferredTimeframes = { has: query.timeframe as string };
    }

    if (query.verified === 'true') {
      where.verificationStatus = true;
    }

    if (query.noMartingale === 'true') {
      where.usesMartingale = false;
    }

    if (query.pricing) {
      const model = (query.pricing as string).toUpperCase();
      if (model === 'FREE' || model === 'PAID') {
        where.subscriptionModel = model as SpSubscriptionModel;
      }
    }

    if (query.updateFrequency) {
      where.updateFrequency = query.updateFrequency as SpUpdateFrequency;
    }

    if (query.isFeatured !== undefined) {
      where.isFeatured = query.isFeatured === 'true';
    }

    let orderBy: Prisma.SignalProviderOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sortBy === 'avgRating' || query.sortBy === 'rating') {
      orderBy = { avgRating: query.sortOrder === 'asc' ? 'asc' : 'desc' };
    } else if (query.sortBy === 'winRate') {
      orderBy = { winRate: query.sortOrder === 'asc' ? 'asc' : 'desc' };
    } else if (query.sortBy === 'totalSignals' || query.sortBy === 'signals') {
      orderBy = { totalSignals: query.sortOrder === 'asc' ? 'asc' : 'desc' };
    } else if (query.sortBy === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    const [providers, total] = await Promise.all([
      prisma.signalProvider.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          plans: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
          signals: {
            where: { status: SignalStatus.ACTIVE },
            take: 3,
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      prisma.signalProvider.count({ where }),
    ]);

    const sanitized = providers.map((p) => serializePublicSP(p));
    const totalPages = Math.ceil(total / limit) || 1;
    return { signalProviders: sanitized, total, page, limit, totalPages };
  }

  /**
   * Public detailed profile by slug
   */
  async getSignalProviderBySlug(slug: string, currentUserId?: string) {
    const sp = await prisma.signalProvider.findUnique({
      where: { slug },
      include: {
        plans: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
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

    // If provider is not approved, allow only owner or admin to preview
    if (sp.status !== ApprovalStatus.APPROVED) {
      let isAuthorized = false;
      if (currentUserId) {
        if (sp.userId === currentUserId) isAuthorized = true;
        else {
          const user = await prisma.user.findUnique({ where: { id: currentUserId } });
          if (user?.role === Role.ADMIN) isAuthorized = true;
        }
      }

      if (!isAuthorized) {
        // If a publicSnapshot exists from previous approval, serve it
        if (sp.publicSnapshot) {
          return sp.publicSnapshot;
        }
        throw new AppError('This signal provider profile is currently undergoing review.', StatusCodes.NOT_FOUND);
      }
    }

    return serializePublicSP(sp);
  }

  /**
   * Private provider profile for logged-in dashboard
   */
  async getMySPProfile(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found.', StatusCodes.NOT_FOUND);
    }

    let sp = await prisma.signalProvider.findUnique({
      where: { userId },
      include: {
        documents: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            fileName: true,
            docType: true,
            reviewStatus: true,
            reviewNote: true,
            periodFrom: true,
            periodTo: true,
            isSensitive: true,
            createdAt: true,
            // Do NOT return raw fileUrl directly
          },
        },
        plans: { orderBy: { sortOrder: 'asc' } },
        agreementAcceptances: {
          where: { partnerType: AgreementAudience.SIGNAL_PROVIDER },
          select: {
            agreementKey: true,
            version: true,
            acceptedAt: true,
          },
        },
      },
    });

    if (!sp) {
      // If admin, auto-create official signals provider
      if (user.role === Role.ADMIN) {
        sp = (await this.ensureOfficialProvider(userId)) as any;
      } else {
        throw new AppError('Signal Provider profile not found. Please register or complete onboarding.', StatusCodes.NOT_FOUND);
      }
    }

    const completion = calculateSPCompletion(
      sp,
      sp?.documents || [],
      sp?.agreementAcceptances || []
    );

    return {
      profile: {
        ...sp,
        userEmail: user.email,
        userName: user.name,
      },
      completion,
    };
  }

  /**
   * Saves a single section draft
   */
  async saveSection(userId: string, section: string, data: any) {
    const sp = await prisma.signalProvider.findUnique({ where: { userId } });
    if (!sp) {
      throw new AppError('Signal Provider profile not found.', StatusCodes.NOT_FOUND);
    }

    let validatedData: Record<string, any> = {};

    switch (section) {
      case 'personal':
        validatedData = personalSchema.partial().parse(data);
        break;
      case 'experience':
        validatedData = experienceBaseSchema.partial().parse(data);
        break;
      case 'performance':
        validatedData = performanceSchema.partial().parse(data);
        break;
      case 'risk': {
        const parsed = riskBaseSchema.partial().parse(data);
        if (parsed.riskRewardPreference) {
          const parts = parsed.riskRewardPreference.split(':');
          if (parts.length === 2) {
            const val = parseFloat(parts[1]) / (parseFloat(parts[0]) || 1);
            if (!isNaN(val)) parsed.riskRewardValue = val;
          }
        }
        validatedData = parsed;
        break;
      }
      case 'verification': {
        const parsed = verificationBaseSchema.partial().parse(data);
        if (parsed.performanceLink) {
          (parsed as any).performanceLinkPlatform = detectPerformancePlatform(parsed.performanceLink);
        }
        validatedData = parsed;
        break;
      }
      case 'additional':
        validatedData = additionalSchema.partial().parse(data);
        break;
      case 'communication':
        validatedData = communicationBaseSchema.partial().parse(data);
        break;
      case 'pricing':
        validatedData = pricingBaseSchema.partial().parse(data);
        // If plans are passed, update plans table
        if (Array.isArray(data.plans)) {
          await prisma.signalProviderPlan.deleteMany({ where: { signalProviderId: sp.id } });
          if (data.plans.length > 0) {
            await prisma.signalProviderPlan.createMany({
              data: data.plans.map((p: any, idx: number) => ({
                signalProviderId: sp.id,
                name: p.name,
                period: p.period as SpPlanPeriod,
                price: new Prisma.Decimal(p.price || 0),
                currency: p.currency || 'USD',
                description: p.description || null,
                sortOrder: idx,
                isActive: true,
              })),
            });
          }
        }
        break;
      case 'declaration':
        if (data.acceptDeclaration) {
          validatedData = { declarationAcceptedAt: new Date() };
        }
        break;
      default:
        throw new AppError(`Unknown section "${section}"`, StatusCodes.BAD_REQUEST);
    }

    // Check if sensitive changes are being made to an APPROVED provider
    let nextStatus = sp.status;
    let nextPublicSnapshot: Prisma.InputJsonValue | undefined = undefined;
    const isApproved = sp.status === ApprovalStatus.APPROVED;
    const hasSensitiveModifications = Object.keys(validatedData).some((k) =>
      SENSITIVE_RE_REVIEW_FIELDS.includes(k)
    );

    if (isApproved && hasSensitiveModifications) {
      nextStatus = ApprovalStatus.PENDING;
      nextPublicSnapshot = serializePublicSP(sp) as unknown as Prisma.InputJsonValue;

      // Notify compliance admin
      const admins = await prisma.user.findMany({ where: { role: Role.ADMIN } });
      if (admins.length > 0) {
        await prisma.notification.createMany({
          data: admins.map((adm) => ({
            userId: adm.id,
            type: NotificationType.WARNING,
            title: 'Signal Provider Re-Review Required',
            message: `${sp.displayName} modified sensitive profile or strategy parameters. Profile reverted to PENDING review.`,
            link: `/admin/signal-providers/${sp.id}`,
          })),
        });
      }
    }

    const updatePayload: Prisma.SignalProviderUpdateInput = {
      ...validatedData,
      status: nextStatus,
    };
    if (nextPublicSnapshot !== undefined) {
      updatePayload.publicSnapshot = nextPublicSnapshot;
    }

    const updated = await prisma.signalProvider.update({
      where: { id: sp.id },
      data: updatePayload,
    });

    // Recompute completion percentage
    const docs = await prisma.signalProviderDocument.findMany({ where: { signalProviderId: sp.id } });
    const acceptances = await prisma.partnerAgreementAcceptance.findMany({
      where: { partnerId: sp.id, partnerType: AgreementAudience.SIGNAL_PROVIDER },
    });
    const completion = calculateSPCompletion(updated, docs, acceptances);

    await prisma.signalProvider.update({
      where: { id: sp.id },
      data: { completionPercent: completion.percent },
    });

    return {
      profile: updated,
      completion,
    };
  }

  /**
   * Upload profile photo
   */
  async uploadPhoto(userId: string, file: Express.Multer.File) {
    const sp = await prisma.signalProvider.findUnique({ where: { userId } });
    if (!sp) {
      throw new AppError('Signal Provider profile not found.', StatusCodes.NOT_FOUND);
    }

    if (!file) {
      throw new AppError('No photo file uploaded.', StatusCodes.BAD_REQUEST);
    }

    // Verify magic bytes
    const isValid = verifyDocumentMagicBytes(file.buffer, file.originalname);
    if (!isValid) {
      throw new AppError('Invalid image file format.', StatusCodes.BAD_REQUEST);
    }

    const uploadRes = await uploadBufferToCloudinary(file.buffer, {
      folder: 'signal_providers/photos',
      publicIdPrefix: `sp_photo_${sp.id.slice(0, 8)}`,
      resourceType: 'image',
      type: 'upload',
    });

    const updated = await prisma.signalProvider.update({
      where: { id: sp.id },
      data: { photo: uploadRes.secure_url },
    });

    return { photo: updated.photo };
  }

  /**
   * Upload private documents (IDENTITY_DOCUMENT or ACCOUNT_STATEMENT)
   */
  async uploadDocuments(
    userId: string,
    files: Express.Multer.File[],
    docType: string,
    metadata?: { periodFrom?: string; periodTo?: string }
  ) {
    const sp = await prisma.signalProvider.findUnique({ where: { userId } });
    if (!sp) {
      throw new AppError('Signal Provider profile not found.', StatusCodes.NOT_FOUND);
    }

    if (!files || files.length === 0) {
      throw new AppError('No files uploaded.', StatusCodes.BAD_REQUEST);
    }

    const allowedDocTypes = ['IDENTITY_DOCUMENT', 'ACCOUNT_STATEMENT', 'TRACK_RECORD_PROOF', 'OTHER'];
    if (!allowedDocTypes.includes(docType)) {
      throw new AppError(`Invalid docType. Allowed: ${allowedDocTypes.join(', ')}`, StatusCodes.BAD_REQUEST);
    }

    const createdDocs = [];

    for (const file of files) {
      // Magic bytes verification
      const isValid = verifyDocumentMagicBytes(file.buffer, file.originalname);
      if (!isValid) {
        throw new AppError(`File ${file.originalname} failed magic-byte verification or is prohibited.`, StatusCodes.BAD_REQUEST);
      }

      // Check for dangerous extensions
      const ext = file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase();
      if (['.html', '.htm', '.svg', '.exe', '.bat', '.cmd', '.sh', '.js', '.py'].includes(ext)) {
        throw new AppError(`File type ${ext} is strictly prohibited due to security policies.`, StatusCodes.BAD_REQUEST);
      }

      const isImage = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
      const isSensitive = ['IDENTITY_DOCUMENT', 'ACCOUNT_STATEMENT'].includes(docType);

      // Upload to Cloudinary with authenticated type for sensitive KYC assets
      const uploadRes = await uploadBufferToCloudinary(file.buffer, {
        folder: `signal_providers/documents/${sp.id}`,
        publicIdPrefix: `doc_${docType.toLowerCase()}`,
        resourceType: isImage ? 'image' : 'raw',
        type: isSensitive ? 'authenticated' : 'upload',
      });

      const doc = await prisma.signalProviderDocument.create({
        data: {
          signalProviderId: sp.id,
          fileUrl: uploadRes.secure_url,
          fileName: file.originalname,
          publicId: uploadRes.public_id,
          docType,
          isSensitive,
          reviewStatus: ApprovalStatus.PENDING,
          periodFrom: metadata?.periodFrom ? new Date(metadata.periodFrom) : null,
          periodTo: metadata?.periodTo ? new Date(metadata.periodTo) : null,
        },
      });

      createdDocs.push({
        id: doc.id,
        fileName: doc.fileName,
        docType: doc.docType,
        reviewStatus: doc.reviewStatus,
        createdAt: doc.createdAt,
      });
    }

    // Recompute completion
    const docs = await prisma.signalProviderDocument.findMany({ where: { signalProviderId: sp.id } });
    const acceptances = await prisma.partnerAgreementAcceptance.findMany({
      where: { partnerId: sp.id, partnerType: AgreementAudience.SIGNAL_PROVIDER },
    });
    const completion = calculateSPCompletion(sp, docs, acceptances);

    await prisma.signalProvider.update({
      where: { id: sp.id },
      data: { completionPercent: completion.percent },
    });

    return { documents: createdDocs, completion };
  }

  /**
   * Deletes a document
   */
  async deleteDocument(userId: string, docId: string) {
    const sp = await prisma.signalProvider.findUnique({ where: { userId } });
    if (!sp) {
      throw new AppError('Signal Provider profile not found.', StatusCodes.NOT_FOUND);
    }

    const doc = await prisma.signalProviderDocument.findFirst({
      where: { id: docId, signalProviderId: sp.id },
    });
    if (!doc) {
      throw new AppError('Document not found or unauthorized.', StatusCodes.NOT_FOUND);
    }

    if (doc.publicId) {
      await deleteCloudinaryAsset(doc.publicId, 'raw');
    }

    await prisma.signalProviderDocument.delete({ where: { id: doc.id } });

    // Recompute completion
    const docs = await prisma.signalProviderDocument.findMany({ where: { signalProviderId: sp.id } });
    const acceptances = await prisma.partnerAgreementAcceptance.findMany({
      where: { partnerId: sp.id, partnerType: AgreementAudience.SIGNAL_PROVIDER },
    });
    const completion = calculateSPCompletion(sp, docs, acceptances);

    await prisma.signalProvider.update({
      where: { id: sp.id },
      data: { completionPercent: completion.percent },
    });

    return { success: true, completion };
  }

  /**
   * Retrieves active agreements for Signal Providers
   */
  async getAgreements() {
    return prisma.partnerAgreement.findMany({
      where: {
        audience: AgreementAudience.SIGNAL_PROVIDER,
        isActive: true,
      },
      select: {
        id: true,
        key: true,
        kind: true,
        title: true,
        body: true,
        version: true,
        updatedAt: true,
      },
      orderBy: { id: 'asc' },
    });
  }

  /**
   * Accepts agreements
   */
  async acceptAgreements(
    userId: string,
    payload: { acceptances: Array<{ key: string; version: number }> },
    ipAddress = '127.0.0.1',
    userAgent = 'Unknown'
  ) {
    const sp = await prisma.signalProvider.findUnique({ where: { userId } });
    if (!sp) {
      throw new AppError('Signal Provider profile not found.', StatusCodes.NOT_FOUND);
    }

    const validated = acceptAgreementsSchema.parse(payload);

    for (const item of validated.acceptances) {
      await prisma.partnerAgreementAcceptance.upsert({
        where: {
          partnerId_agreementKey_version: {
            partnerId: sp.id,
            agreementKey: item.key,
            version: item.version,
          },
        },
        update: {
          acceptedAt: new Date(),
          ipAddress,
          userAgent,
        },
        create: {
          partnerType: AgreementAudience.SIGNAL_PROVIDER,
          partnerId: sp.id,
          signalProviderId: sp.id,
          agreementKey: item.key,
          version: item.version,
          ipAddress,
          userAgent,
        },
      });

      // If item is DECLARATION, also record on sp.declarationAcceptedAt
      if (item.key === 'DECLARATION') {
        await prisma.signalProvider.update({
          where: { id: sp.id },
          data: { declarationAcceptedAt: new Date() },
        });
      }
    }

    // Recompute completion
    const docs = await prisma.signalProviderDocument.findMany({ where: { signalProviderId: sp.id } });
    const acceptances = await prisma.partnerAgreementAcceptance.findMany({
      where: { partnerId: sp.id, partnerType: AgreementAudience.SIGNAL_PROVIDER },
    });
    const completion = calculateSPCompletion(sp, docs, acceptances);

    await prisma.signalProvider.update({
      where: { id: sp.id },
      data: { completionPercent: completion.percent },
    });

    return {
      success: true,
      completionPercent: completion.percent,
      missingFields: completion.missingFields,
      isSubmittable: completion.isSubmittable,
    };
  }

  /**
   * Submits Signal Provider onboarding for compliance review
   */
  async submitOnboarding(userId: string) {
    const sp = await prisma.signalProvider.findUnique({
      where: { userId },
      include: {
        documents: true,
        agreementAcceptances: { where: { partnerType: AgreementAudience.SIGNAL_PROVIDER } },
        plans: true,
      },
    });

    if (!sp) {
      throw new AppError('Signal Provider profile not found.', StatusCodes.NOT_FOUND);
    }

    // 1. Validate full submit fields
    const parsed = spSubmitSchema.safeParse(sp);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      }));
      throw new AppError(
        `Onboarding cannot be submitted due to incomplete profile requirements: ${errors.map((e) => e.message).join('; ')}`,
        StatusCodes.BAD_REQUEST,
        errors
      );
    }

    // 2. Validate mandatory documents: ID and Statement
    const hasId = sp.documents.some((d) => d.docType === 'IDENTITY_DOCUMENT');
    if (!hasId) {
      throw new AppError('An official Identification Document (passport or national ID) must be uploaded.', StatusCodes.BAD_REQUEST);
    }

    const hasStatement = sp.documents.some((d) => d.docType === 'ACCOUNT_STATEMENT');
    if (!hasStatement) {
      throw new AppError('A trading account statement (last 3 months) must be uploaded.', StatusCodes.BAD_REQUEST);
    }

    // 3. Validate agreements acceptance (all 9 agreements/commitments + declaration)
    const activeAgreements = await prisma.partnerAgreement.findMany({
      where: { audience: AgreementAudience.SIGNAL_PROVIDER, isActive: true },
    });

    for (const ag of activeAgreements) {
      const hasAccepted = sp.agreementAcceptances.some(
        (acc) => acc.agreementKey === ag.key && acc.version >= ag.version
      );
      if (!hasAccepted) {
        throw new AppError(
          `Agreement or commitment "${ag.title}" must be reviewed and accepted prior to submission.`,
          StatusCodes.BAD_REQUEST
        );
      }
    }

    // 4. Compute review flags
    const reviewFlags = computeSPReviewFlags(sp, sp.documents);

    // 5. Update status to SUBMITTED & PENDING
    const updated = await prisma.signalProvider.update({
      where: { id: sp.id },
      data: {
        onboardingStatus: OnboardingStatus.SUBMITTED,
        status: ApprovalStatus.PENDING,
        submittedAt: new Date(),
        rejectionReason: null,
        changesRequestedNote: null,
        completionPercent: 100,
        reviewFlags: reviewFlags as any,
      },
    });

    // 6. Notify Admins
    const admins = await prisma.user.findMany({ where: { role: Role.ADMIN } });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: NotificationType.APPROVAL,
          title: 'Signal Provider Submitted for Verification',
          message: `${sp.displayName} has submitted their full dossier for compliance verification.${reviewFlags.length > 0 ? ` (${reviewFlags.length} flags detected)` : ''}`,
          link: `/admin/signal-providers/${sp.id}`,
        })),
      });

      const notifyEmail = process.env.ADMIN_NOTIFY_EMAIL || 'compliance@edutradefx.com';
      try {
        await transporter.sendMail({
          from: `"EdutradeFX Compliance" <${process.env.SMTP_USER || 'no-reply@edutradefx.com'}>`,
          to: notifyEmail,
          subject: `[Compliance Review] Signal Provider: ${sp.displayName}`,
          text: `A Signal Provider has submitted their onboarding dossier.\nName: ${sp.displayName}\nLegal Name: ${sp.legalFullName}\nFlags: ${reviewFlags.join(', ') || 'None'}\nReview at: /admin/signal-providers/${sp.id}`,
        });
      } catch (err) {
        // Mailer error non-blocking
      }
    }

    return {
      success: true,
      onboardingStatus: updated.onboardingStatus,
      status: updated.status,
      reviewFlags,
    };
  }

  /**
   * Investor & Subscriber Enquiries (S2 fix)
   */
  async getMyEnquiries(userId: string, query: any) {
    const sp = await prisma.signalProvider.findUnique({ where: { userId } });
    if (!sp) {
      throw new AppError('Signal Provider profile not found.', StatusCodes.NOT_FOUND);
    }

    const { skip, take, page, limit } = parsePagination(query);
    const where: Prisma.EnquiryWhereInput = {
      signalProviderId: sp.id,
    };

    if (query.unread === 'true') {
      where.isRead = false;
    }

    const [enquiries, total, unreadCount] = await Promise.all([
      prisma.enquiry.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.enquiry.count({ where }),
      prisma.enquiry.count({ where: { signalProviderId: sp.id, isRead: false } }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { enquiries, total, unreadCount, page, limit, totalPages };
  }

  /**
   * Mark enquiry as read (S2 fix)
   */
  async markEnquiryAsRead(userId: string, enquiryId: string) {
    const sp = await prisma.signalProvider.findUnique({ where: { userId } });
    if (!sp) {
      throw new AppError('Signal Provider profile not found.', StatusCodes.NOT_FOUND);
    }

    const enquiry = await prisma.enquiry.findFirst({
      where: { id: enquiryId, signalProviderId: sp.id },
    });
    if (!enquiry) {
      throw new AppError('Enquiry not found.', StatusCodes.NOT_FOUND);
    }

    return prisma.enquiry.update({
      where: { id: enquiryId },
      data: { isRead: true },
    });
  }

  /**
   * Send enquiry to a signal provider from public page
   */
  async sendEnquiry(spId: string, data: any, currentUserId?: string) {
    const sp = await prisma.signalProvider.findUnique({
      where: { id: spId },
      include: { user: { select: { email: true, name: true } } },
    });

    if (!sp) {
      throw new AppError('Signal Provider not found.', StatusCodes.NOT_FOUND);
    }

    const enquiry = await prisma.enquiry.create({
      data: {
        userId: currentUserId || null,
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || null,
        message: data.message.trim(),
        targetType: EnquiryTargetType.SIGNAL_PROVIDER,
        signalProviderId: sp.id,
      },
    });

    // Notify signal provider
    await prisma.notification.create({
      data: {
        userId: sp.userId,
        type: NotificationType.ENQUIRY,
        title: 'New Subscriber Enquiry',
        message: `${data.name} submitted an enquiry regarding your signal service.`,
        link: '/dashboard/signal-provider/enquiries',
      },
    });

    return enquiry;
  }

  /**
   * Signals Management (S1, S5, S6 fixes)
   */
  async getSignals(spId: string, query: any) {
    const { skip, take, page, limit } = parsePagination(query);
    const where: Prisma.SignalWhereInput = { signalProviderId: spId };

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

    const sanitizedSignals = signals.map((s) => ({
      ...s,
      disclaimer: 'Educational purposes only. Not financial advice.',
    }));

    const totalPages = Math.ceil(total / limit) || 1;
    return { signals: sanitizedSignals, total, page, limit, totalPages };
  }

  async getMySignals(userId: string, query: any) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    let sp = await prisma.signalProvider.findUnique({ where: { userId } });

    if (!sp && user?.role === Role.ADMIN) {
      sp = await this.ensureOfficialProvider(userId);
    }

    if (!sp) {
      throw new AppError('Signal Provider profile not found.', StatusCodes.NOT_FOUND);
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

  /**
   * Creates a new signal.
   * FIX S1: COMPLIANCE BYPASS ELIMINATED. Posting strictly requires APPROVED status.
   */
  async createSignal(userId: string, data: any) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    let sp = await prisma.signalProvider.findUnique({ where: { userId } });

    if (!sp && user?.role === Role.ADMIN) {
      sp = await this.ensureOfficialProvider(userId);
    }

    if (!sp) {
      throw new AppError('Signal Provider profile not found. Please complete registration first.', StatusCodes.NOT_FOUND);
    }

    // STRICT COMPLIANCE CHECK - NO BYPASS IN ANY NODE_ENV OR WITH ALLOW_MOCK_PAYMENTS
    if (sp.status !== ApprovalStatus.APPROVED) {
      throw new AppError(
        'Your profile must be approved by compliance before posting signals. Posting while unapproved is prohibited.',
        StatusCodes.FORBIDDEN
      );
    }

    if (sp.onboardingStatus !== OnboardingStatus.SUBMITTED) {
      throw new AppError(
        'You must complete and submit onboarding before posting trade signals.',
        StatusCodes.FORBIDDEN
      );
    }

    // Rate-limit check (max 60 signals/hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await prisma.signal.count({
      where: {
        signalProviderId: sp.id,
        createdAt: { gte: oneHourAgo },
      },
    });
    if (recentCount >= 60) {
      throw new AppError('Rate limit exceeded: You can publish a maximum of 60 signals per hour.', StatusCodes.TOO_MANY_REQUESTS);
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

    return {
      ...signal,
      disclaimer: 'Educational purposes only. Not financial advice.',
    };
  }

  /**
   * Updates a signal.
   * FIX S6: Recalculates win rate ONLY on closed signals with recorded pipsGained.
   */
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

    // Audit integrity: once created, entryPrice, stopLoss, and takeProfit cannot be altered
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

    // FIX S6: Recalculate win rate ONLY counting closed signals that have a non-null pipsGained
    if (signal.signalProviderId) {
      const closedWithResult = await prisma.signal.findMany({
        where: {
          signalProviderId: signal.signalProviderId,
          status: SignalStatus.CLOSED,
          pipsGained: { not: null },
        },
        select: { pipsGained: true },
      });

      if (closedWithResult.length > 0) {
        const winningSignals = closedWithResult.filter((s) => (s.pipsGained ?? 0) > 0).length;
        const winRate = parseFloat(((winningSignals / closedWithResult.length) * 100).toFixed(1));
        await prisma.signalProvider.update({
          where: { id: signal.signalProviderId },
          data: { winRate },
        });
      }
    }

    return {
      ...updated,
      disclaimer: 'Educational purposes only. Not financial advice.',
    };
  }

  /**
   * Deletes a signal
   */
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

    // Decrement totalSignals
    await prisma.signalProvider.update({
      where: { id: signal.signalProviderId },
      data: { totalSignals: { decrement: 1 } },
    });

    return { success: true };
  }

  /**
   * Reviews
   */
  async getReviews(spId: string, query: any) {
    const { skip, take, page, limit } = parsePagination(query);
    const where = { signalProviderId: spId, isApproved: true };

    const [reviews, total] = await Promise.all([
      prisma.signalProviderReview.findMany({
        where,
        skip,
        take,
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.signalProviderReview.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { reviews, total, page, limit, totalPages };
  }

  async addReview(spId: string, userId: string, data: any) {
    const sp = await prisma.signalProvider.findUnique({ where: { id: spId } });
    if (!sp) {
      throw new AppError('Signal Provider not found.', StatusCodes.NOT_FOUND);
    }

    if (sp.userId === userId) {
      throw new AppError('You cannot review your own signal provider profile.', StatusCodes.BAD_REQUEST);
    }

    const existing = await prisma.signalProviderReview.findUnique({
      where: { signalProviderId_userId: { signalProviderId: spId, userId } },
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
        isApproved: false, // Moderated by default
      },
    });

    return review;
  }

  /**
   * Plans management
   */
  async getPlans(userId: string) {
    const sp = await prisma.signalProvider.findUnique({ where: { userId } });
    if (!sp) throw new AppError('Signal Provider not found.', StatusCodes.NOT_FOUND);

    return prisma.signalProviderPlan.findMany({
      where: { signalProviderId: sp.id },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async savePlans(userId: string, plans: any[]) {
    const sp = await prisma.signalProvider.findUnique({ where: { userId } });
    if (!sp) throw new AppError('Signal Provider not found.', StatusCodes.NOT_FOUND);

    if (plans.length > 5) {
      throw new AppError('Maximum 5 subscription plans allowed.', StatusCodes.BAD_REQUEST);
    }

    await prisma.signalProviderPlan.deleteMany({ where: { signalProviderId: sp.id } });

    if (plans.length > 0) {
      await prisma.signalProviderPlan.createMany({
        data: plans.map((p, idx) => ({
          signalProviderId: sp.id,
          name: p.name,
          period: p.period as SpPlanPeriod,
          price: new Prisma.Decimal(p.price || 0),
          currency: p.currency || 'USD',
          description: p.description || null,
          sortOrder: idx,
          isActive: true,
        })),
      });
    }

    return prisma.signalProviderPlan.findMany({
      where: { signalProviderId: sp.id },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * Legacy registerSignalProvider method for backward compatibility
   */
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
        riskCategory: data.riskCategory,
        status: ApprovalStatus.PENDING,
        onboardingStatus: OnboardingStatus.DRAFT,
      },
    });

    return sp;
  }

  /**
   * Legacy updateSignalProvider for backward compatibility
   */
  async updateSignalProvider(userId: string, data: any, photoFile?: Express.Multer.File) {
    const sp = await prisma.signalProvider.findUnique({ where: { userId } });
    if (!sp) {
      throw new AppError('Signal Provider profile not found.', StatusCodes.NOT_FOUND);
    }

    const photoUrl = photoFile ? (photoFile as any).path || (photoFile as any).secure_url : sp.photo;

    return await prisma.signalProvider.update({
      where: { id: sp.id },
      data: {
        ...(photoUrl && { photo: photoUrl }),
        ...(data.displayName && { displayName: data.displayName }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.strategy !== undefined && { strategy: data.strategy }),
        ...(data.strategyDetail !== undefined && { strategyDetail: data.strategyDetail }),
        ...(data.yearsTrading !== undefined && { yearsTrading: parseInt(data.yearsTrading, 10) || 0 }),
        ...(data.tradingStyles && { tradingStyles: data.tradingStyles }),
        ...(data.tradingStyleDescription !== undefined && { tradingStyleDescription: data.tradingStyleDescription }),
        ...(data.telegramChannelUrl !== undefined && { telegramChannelUrl: data.telegramChannelUrl }),
        ...(data.instruments && { instruments: Array.isArray(data.instruments) ? data.instruments : [data.instruments] }),
        ...(data.riskCategory !== undefined && { riskCategory: data.riskCategory }),
      },
    });
  }
}

export const signalProviderService = new SignalProviderService();
