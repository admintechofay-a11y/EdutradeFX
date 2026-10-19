import { StatusCodes } from 'http-status-codes';
import path from 'path';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { generateUniqueSlug } from '../../utils/slug.utils';
import { parsePagination } from '../../utils/pagination.utils';
import {
  ApprovalStatus,
  AmEntityType,
  OnboardingStatus,
  AgreementAudience,
  AgreementKind,
  EnquiryTargetType,
  NotificationType,
  Prisma,
  Role,
} from '@prisma/client';
import { transporter } from '../../config/email';
import {
  calculateAMCompletion,
  mapLegacyTradingStyle,
  ALL_AGREEMENT_KEYS,
  MASTER_TERMS_KEY,
} from './am.utils';
import { serializePublicAM } from './am.serializer';
import {
  personalSchema,
  regulatorySchema,
  aboutSchema,
  experienceSchema,
  styleSchema,
  strategySchema,
  riskSchema,
  settlementSchema,
  sharingSchema,
  acceptAgreementsSchema,
  amSubmitSchema,
} from './am.schemas';
import {
  uploadBufferToCloudinary,
  deleteCloudinaryAsset,
} from '../../utils/cloudinary.utils';
import {
  verifyImageMagicBytes,
  verifyDocumentMagicBytes,
} from '../../middleware/upload.middleware';
import { logger } from '../../utils/logger';

const DOC_LIMITS: Record<string, number> = {
  CV_RESUME: 1,
  PERFORMANCE_RECORD: 5,
  STRATEGY_DOCUMENT: 5,
  CERTIFICATE: 10,
  PAST_RESULT_SCREENSHOT: 10,
  REGULATORY_PROOF: 3,
};

const SENSITIVE_AM_FIELDS = [
  'entityType',
  'isRegulated',
  'regulatorName',
  'regulatorRegistrationNumber',
  'regulatorCountry',
  'yearsExperience',
  'tradingStyles',
  'preferredInstruments',
  'riskTolerance',
  'riskRewardRatio',
  'lossPerTradePercent',
  'dailyTrades',
  'dailyLots',
  'dailyStopLossPoints',
  'dailyTakeProfitPoints',
  'settlementCycle',
  'profitSharingPercent',
  'lossSharingPercent',
  'clientFundSecurity',
  'recommendsBroker',
  'recommendedBrokerName',
  'recommendedBrokerPlatform',
];

export class AccountManagerService {
  /**
   * Retrieves full private profile for the logged in Account Manager.
   */
  async getMyAMProfile(userId: string) {
    const am = await prisma.accountManager.findUnique({
      where: { userId },
      include: {
        documents: { orderBy: { createdAt: 'desc' } },
        agreementAcceptances: { orderBy: { acceptedAt: 'desc' } },
        enquiries: { orderBy: { createdAt: 'desc' }, take: 5 },
        reviews: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    if (!am) {
      throw new AppError('Account Manager profile not found.', StatusCodes.NOT_FOUND);
    }

    const completion = calculateAMCompletion(am, am.documents, am.agreementAcceptances);

    // Sync completionPercent if changed
    if (am.completionPercent !== completion.percent) {
      await prisma.accountManager.update({
        where: { id: am.id },
        data: { completionPercent: completion.percent },
      });
      am.completionPercent = completion.percent;
    }

    return {
      ...am,
      completionPercent: completion.percent,
      missingFields: completion.missingFields,
      missingSections: completion.missingSections,
      isSubmittable: completion.isSubmittable,
    };
  }

  /**
   * Saves one section in draft mode (partial).
   */
  async saveSection(userId: string, section: string, data: any) {
    const am = await prisma.accountManager.findUnique({
      where: { userId },
      include: { documents: true, agreementAcceptances: true },
    });
    if (!am) {
      throw new AppError('Account Manager profile not found.', StatusCodes.NOT_FOUND);
    }

    let parsedData: any = {};

    switch (section) {
      case 'personal':
        parsedData = personalSchema.parse(data);
        break;
      case 'regulatory':
        parsedData = regulatorySchema.parse(data);
        break;
      case 'about':
        parsedData = aboutSchema.parse(data);
        break;
      case 'experience':
        parsedData = experienceSchema.parse(data);
        break;
      case 'style':
        parsedData = styleSchema.parse(data);
        break;
      case 'strategy':
        parsedData = strategySchema.parse(data);
        break;
      case 'risk': {
        parsedData = riskSchema.parse(data);
        if (parsedData.riskRewardRatio) {
          const parts = parsedData.riskRewardRatio.split(':').map((s: string) => parseFloat(s.trim()));
          if (parts.length === 2 && parts[0] > 0 && !isNaN(parts[1])) {
            parsedData.riskRewardValue = parts[1] / parts[0];
          }
        }
        break;
      }
      case 'settlement':
        parsedData = settlementSchema.parse(data);
        break;
      case 'sharing':
        parsedData = sharingSchema.parse(data);
        break;
      default:
        throw new AppError(`Invalid section: ${section}`, StatusCodes.BAD_REQUEST);
    }

    // Check sensitive fields re-review trigger if APPROVED
    let newStatus = am.status;
    let newSnapshot = am.publicSnapshot;
    if (am.status === ApprovalStatus.APPROVED) {
      const hasSensitiveChanges = SENSITIVE_AM_FIELDS.some((field) => {
        if (parsedData[field] === undefined) return false;
        return JSON.stringify(parsedData[field]) !== JSON.stringify((am as any)[field]);
      });

      if (hasSensitiveChanges) {
        newStatus = ApprovalStatus.PENDING;
        newSnapshot = serializePublicAM(am);
        logger.info(`AM ${am.id} modified sensitive fields in section ${section}. Moving from APPROVED to PENDING.`);

        // Notify admins of re-review
        const admins = await prisma.user.findMany({ where: { role: Role.ADMIN } });
        if (admins.length > 0) {
          await prisma.notification.createMany({
            data: admins.map((admin) => ({
              userId: admin.id,
              type: NotificationType.APPROVAL,
              title: 'Account Manager Re-Review Triggered',
              message: `${am.fullName} made sensitive updates to ${section} section. Re-review required.`,
              link: `/admin/account-managers/${am.id}`,
            })),
          });
        }
      }
    }

    // Merge updated fields
    const updated = await prisma.accountManager.update({
      where: { id: am.id },
      data: {
        ...parsedData,
        status: newStatus,
        publicSnapshot: newSnapshot as any,
      },
      include: {
        documents: true,
        agreementAcceptances: true,
      },
    });

    // Recompute completion %
    const completion = calculateAMCompletion(updated, updated.documents, updated.agreementAcceptances);
    await prisma.accountManager.update({
      where: { id: am.id },
      data: { completionPercent: completion.percent },
    });
    updated.completionPercent = completion.percent;

    return {
      ...updated,
      completionPercent: completion.percent,
      missingFields: completion.missingFields,
      missingSections: completion.missingSections,
      isSubmittable: completion.isSubmittable,
    };
  }

  /**
   * Uploads profile photo with magic-byte verification and Cloudinary storage.
   */
  async uploadPhoto(userId: string, file: Express.Multer.File) {
    const am = await prisma.accountManager.findUnique({ where: { userId } });
    if (!am) {
      throw new AppError('Account Manager profile not found.', StatusCodes.NOT_FOUND);
    }

    if (!file || !file.buffer) {
      throw new AppError('No photo file provided.', StatusCodes.BAD_REQUEST);
    }

    const isValidMagic = verifyImageMagicBytes(file.buffer);
    if (!isValidMagic) {
      throw new AppError('Invalid image file format. Magic-byte signature check failed.', StatusCodes.BAD_REQUEST);
    }

    // Upload to Cloudinary
    const uploadResult = await uploadBufferToCloudinary(file.buffer, {
      folder: 'account-managers/photos',
      publicIdPrefix: `am_${am.id}`,
      resourceType: 'image',
      type: 'upload',
      transformation: [{ width: 500, height: 500, crop: 'fill', gravity: 'face' }],
    });

    const updated = await prisma.accountManager.update({
      where: { id: am.id },
      data: { photo: uploadResult.secure_url },
      include: { documents: true, agreementAcceptances: true },
    });

    const completion = calculateAMCompletion(updated, updated.documents, updated.agreementAcceptances);
    await prisma.accountManager.update({
      where: { id: am.id },
      data: { completionPercent: completion.percent },
    });

    return { photo: uploadResult.secure_url, completionPercent: completion.percent };
  }

  /**
   * Uploads a document or screenshot for Account Manager.
   */
  async uploadDocument(
    userId: string,
    file: Express.Multer.File,
    docType: string,
    caption?: string,
    periodNote?: string
  ) {
    const am = await prisma.accountManager.findUnique({
      where: { userId },
      include: { documents: true },
    });
    if (!am) {
      throw new AppError('Account Manager profile not found.', StatusCodes.NOT_FOUND);
    }

    if (!DOC_LIMITS[docType]) {
      throw new AppError(`Invalid document type: ${docType}`, StatusCodes.BAD_REQUEST);
    }

    const currentCount = am.documents.filter((d) => d.docType === docType).length;
    if (currentCount >= DOC_LIMITS[docType]) {
      throw new AppError(
        `Maximum limit of ${DOC_LIMITS[docType]} file(s) reached for ${docType}.`,
        StatusCodes.BAD_REQUEST
      );
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const isValidBytes = verifyDocumentMagicBytes(file.buffer, ext);
    if (!isValidBytes) {
      throw new AppError('File failed magic-byte verification.', StatusCodes.BAD_REQUEST);
    }

    // Determine privacy & resource type
    const isScreenshot = docType === 'PAST_RESULT_SCREENSHOT';
    const resourceType = isScreenshot ? 'image' : 'raw';
    // Private documents use authenticated storage
    const storageType = 'authenticated';

    const uploadRes = await uploadBufferToCloudinary(file.buffer, {
      folder: 'account-managers/documents',
      publicIdPrefix: `am_${am.id}_${docType.toLowerCase()}`,
      resourceType,
      type: storageType,
    });

    const doc = await prisma.accountManagerDocument.create({
      data: {
        accountManagerId: am.id,
        fileUrl: uploadRes.secure_url,
        fileName: file.originalname,
        docType,
        caption: caption || null,
        periodNote: periodNote || null,
        isPublic: false,
        reviewStatus: ApprovalStatus.PENDING,
        publicId: uploadRes.public_id,
      },
    });

    // Sensitive upload triggers re-review if currently APPROVED
    if (am.status === ApprovalStatus.APPROVED) {
      await prisma.accountManager.update({
        where: { id: am.id },
        data: {
          status: ApprovalStatus.PENDING,
          publicSnapshot: serializePublicAM(am) as any,
        },
      });
    }

    // Recompute completion
    const refreshedDocs = await prisma.accountManagerDocument.findMany({ where: { accountManagerId: am.id } });
    const acceptances = await prisma.partnerAgreementAcceptance.findMany({
      where: { partnerId: am.id, partnerType: AgreementAudience.ACCOUNT_MANAGER },
    });
    const completion = calculateAMCompletion(am, refreshedDocs, acceptances);
    await prisma.accountManager.update({
      where: { id: am.id },
      data: { completionPercent: completion.percent },
    });

    return doc;
  }

  /**
   * Deletes an Account Manager document. Owner only.
   */
  async deleteDocument(userId: string, docId: string) {
    const am = await prisma.accountManager.findUnique({ where: { userId } });
    if (!am) {
      throw new AppError('Account Manager profile not found.', StatusCodes.NOT_FOUND);
    }

    const doc = await prisma.accountManagerDocument.findFirst({
      where: { id: docId, accountManagerId: am.id },
    });
    if (!doc) {
      throw new AppError('Document not found or unauthorized.', StatusCodes.NOT_FOUND);
    }

    // Delete asset from Cloudinary
    if (doc.publicId) {
      const isScreenshot = doc.docType === 'PAST_RESULT_SCREENSHOT';
      await deleteCloudinaryAsset(doc.publicId, isScreenshot ? 'image' : 'raw');
    }

    await prisma.accountManagerDocument.delete({ where: { id: doc.id } });

    // If AM was APPROVED, moving to PENDING
    if (am.status === ApprovalStatus.APPROVED) {
      await prisma.accountManager.update({
        where: { id: am.id },
        data: {
          status: ApprovalStatus.PENDING,
          publicSnapshot: serializePublicAM(am) as any,
        },
      });
    }

    // Recompute completion
    const refreshedDocs = await prisma.accountManagerDocument.findMany({ where: { accountManagerId: am.id } });
    const acceptances = await prisma.partnerAgreementAcceptance.findMany({
      where: { partnerId: am.id, partnerType: AgreementAudience.ACCOUNT_MANAGER },
    });
    const completion = calculateAMCompletion(am, refreshedDocs, acceptances);
    await prisma.accountManager.update({
      where: { id: am.id },
      data: { completionPercent: completion.percent },
    });

    return { success: true };
  }

  /**
   * Retrieves active agreements for onboarding acceptance.
   */
  async getAgreements() {
    return prisma.partnerAgreement.findMany({
      where: { audience: AgreementAudience.ACCOUNT_MANAGER, isActive: true },
      select: {
        id: true,
        key: true,
        title: true,
        body: true,
        version: true,
        updatedAt: true,
      },
      orderBy: { id: 'asc' },
    });
  }

  /**
   * Records acceptance of agreements.
   */
  async acceptAgreements(
    userId: string,
    payload: { acceptances: Array<{ key: string; version: number }>; master: boolean },
    ipAddress = '127.0.0.1',
    userAgent = 'Unknown'
  ) {
    const am = await prisma.accountManager.findUnique({ where: { userId } });
    if (!am) {
      throw new AppError('Account Manager profile not found.', StatusCodes.NOT_FOUND);
    }

    const validated = acceptAgreementsSchema.parse(payload);

    for (const item of validated.acceptances) {
      await prisma.partnerAgreementAcceptance.upsert({
        where: {
          partnerId_agreementKey_version: {
            partnerId: am.id,
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
          partnerType: AgreementAudience.ACCOUNT_MANAGER,
          partnerId: am.id,
          accountManagerId: am.id,
          agreementKey: item.key,
          version: item.version,
          ipAddress,
          userAgent,
        },
      });
    }

    // Master terms acceptance
    if (validated.master) {
      const masterAg = await prisma.partnerAgreement.findUnique({
        where: {
          audience_key: {
            audience: AgreementAudience.ACCOUNT_MANAGER,
            key: MASTER_TERMS_KEY,
          },
        },
      });
      const masterVersion = masterAg ? masterAg.version : 1;
      await prisma.partnerAgreementAcceptance.upsert({
        where: {
          partnerId_agreementKey_version: {
            partnerId: am.id,
            agreementKey: MASTER_TERMS_KEY,
            version: masterVersion,
          },
        },
        update: {
          acceptedAt: new Date(),
          ipAddress,
          userAgent,
        },
        create: {
          partnerType: AgreementAudience.ACCOUNT_MANAGER,
          partnerId: am.id,
          accountManagerId: am.id,
          agreementKey: MASTER_TERMS_KEY,
          version: masterVersion,
          ipAddress,
          userAgent,
        },
      });
    }

    // Recompute completion
    const docs = await prisma.accountManagerDocument.findMany({ where: { accountManagerId: am.id } });
    const acceptances = await prisma.partnerAgreementAcceptance.findMany({
      where: { partnerId: am.id, partnerType: AgreementAudience.ACCOUNT_MANAGER },
    });
    const completion = calculateAMCompletion(am, docs, acceptances);
    await prisma.accountManager.update({
      where: { id: am.id },
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
   * Final submission gating: validates all required fields, CV presence, and 7 agreements + master.
   */
  async submitOnboarding(userId: string) {
    const am = await prisma.accountManager.findUnique({
      where: { userId },
      include: {
        documents: true,
        agreementAcceptances: true,
      },
    });
    if (!am) {
      throw new AppError('Account Manager profile not found.', StatusCodes.NOT_FOUND);
    }

    // 1. Validate full submit fields
    const parsed = amSubmitSchema.safeParse(am);
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

    // 2. Validate CV document presence
    const hasCV = am.documents.some((d) => d.docType === 'CV_RESUME');
    if (!hasCV) {
      throw new AppError('A CV or Resume document must be uploaded prior to submission.', StatusCodes.BAD_REQUEST);
    }

    // 3. Validate agreements acceptance (all 7 + master)
    const activeAgreements = await prisma.partnerAgreement.findMany({
      where: { audience: AgreementAudience.ACCOUNT_MANAGER, isActive: true },
    });
    for (const ag of activeAgreements) {
      const hasAccepted = am.agreementAcceptances.some(
        (acc) => acc.agreementKey === ag.key && acc.version >= ag.version
      );
      if (!hasAccepted) {
        throw new AppError(
          `Agreement ${ag.title} must be reviewed and accepted before submission.`,
          StatusCodes.BAD_REQUEST
        );
      }
    }

    // 4. Update status to SUBMITTED & PENDING
    const updated = await prisma.accountManager.update({
      where: { id: am.id },
      data: {
        onboardingStatus: OnboardingStatus.SUBMITTED,
        status: ApprovalStatus.PENDING,
        submittedAt: new Date(),
        rejectionReason: null,
        changesRequestedNote: null,
        completionPercent: 100,
      },
    });

    // 5. Notify Admins
    const admins = await prisma.user.findMany({ where: { role: Role.ADMIN } });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: NotificationType.APPROVAL,
          title: 'Account Manager Dossier Submitted',
          message: `${am.fullName} submitted their complete onboarding application for review.`,
          link: `/admin/account-managers/${am.id}`,
        })),
      });
    }

    return updated;
  }

  /**
   * Public directory list of approved Account Managers.
   */
  async getAccountManagers(query: any) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.AccountManagerWhereInput = {
      status: ApprovalStatus.APPROVED,
    };

    if (query.search || query.q) {
      const term = (query.search || query.q) as string;
      where.OR = [
        { fullName: { contains: term, mode: 'insensitive' } },
        { bio: { contains: term, mode: 'insensitive' } },
        { tagline: { contains: term, mode: 'insensitive' } },
        { speciality: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (query.tradingStyle) {
      where.tradingStyles = { has: query.tradingStyle as string };
    }

    if (query.riskTolerance) {
      where.riskTolerance = query.riskTolerance as any;
    }

    if (query.settlementCycle) {
      where.settlementCycle = query.settlementCycle as any;
    }

    if (query.platform) {
      where.preferredPlatforms = { has: query.platform as string };
    }

    if (query.instrument) {
      where.preferredInstruments = { has: query.instrument as string };
    }

    if (query.country) {
      where.OR = [
        { country: { equals: query.country as string, mode: 'insensitive' } },
        { countryCode: { equals: query.country as string, mode: 'insensitive' } },
      ];
    }

    if (query.minYears) {
      where.yearsExperience = { gte: parseInt(query.minYears as string, 10) };
    }

    if (query.regulated === 'true') {
      where.isRegulated = true;
      where.regulatoryVerified = true;
    }

    if (query.isFeatured !== undefined) {
      where.isFeatured = query.isFeatured === 'true';
    }

    let orderBy: Prisma.AccountManagerOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sortBy === 'avgRating' || query.sortBy === 'rating') {
      orderBy = { avgRating: query.sortOrder === 'asc' ? 'asc' : 'desc' };
    } else if (query.sortBy === 'yearsExperience' || query.sortBy === 'experience') {
      orderBy = { yearsExperience: query.sortOrder === 'asc' ? 'asc' : 'desc' };
    } else if (query.sortBy === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    const [accountManagers, total] = await Promise.all([
      prisma.accountManager.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          documents: { where: { isPublic: true, reviewStatus: ApprovalStatus.APPROVED } },
          reviews: { where: { isApproved: true } },
        },
      }),
      prisma.accountManager.count({ where }),
    ]);

    const serialized = accountManagers.map((am) => serializePublicAM(am));
    const totalPages = Math.ceil(total / limit) || 1;
    return { accountManagers: serialized, total, page, limit, totalPages };
  }

  /**
   * Public or authenticated retrieval of an Account Manager by slug.
   */
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

    const isOwner = currentUserId && am.userId === currentUserId;
    let isAdmin = false;
    if (currentUserId && !isOwner) {
      const viewer = await prisma.user.findUnique({ where: { id: currentUserId }, select: { role: true } });
      isAdmin = viewer?.role === Role.ADMIN;
    }

    // If profile is not APPROVED
    if (am.status !== ApprovalStatus.APPROVED && !isOwner && !isAdmin) {
      // If approved snapshot exists while under re-review, return the snapshot
      if (am.publicSnapshot) {
        return am.publicSnapshot;
      }
      throw new AppError('Profile is currently unavailable.', StatusCodes.NOT_FOUND);
    }

    // Owner or Admin gets full object (including private documents and contact info)
    if (isOwner || isAdmin) {
      return am;
    }

    // Public visitor gets strictly serialized allowlisted fields
    return serializePublicAM(am);
  }

  /**
   * Retrieves enquiries for the logged-in Account Manager with pagination and status filter.
   */
  async getMyEnquiries(userId: string, query: any) {
    const am = await prisma.accountManager.findUnique({ where: { userId } });
    if (!am) {
      throw new AppError('Account Manager profile not found.', StatusCodes.NOT_FOUND);
    }

    const { skip, take, page, limit } = parsePagination(query);
    const where: Prisma.EnquiryWhereInput = {
      accountManagerId: am.id,
    };

    if (query.isRead !== undefined) {
      where.isRead = query.isRead === 'true';
    }

    const [enquiries, total] = await Promise.all([
      prisma.enquiry.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.enquiry.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { enquiries, total, page, limit, totalPages };
  }

  /**
   * Marks an inquiry as read.
   */
  async markEnquiryRead(userId: string, enquiryId: string) {
    const am = await prisma.accountManager.findUnique({ where: { userId } });
    if (!am) {
      throw new AppError('Account Manager profile not found.', StatusCodes.NOT_FOUND);
    }

    const enquiry = await prisma.enquiry.findFirst({
      where: { id: enquiryId, accountManagerId: am.id },
    });
    if (!enquiry) {
      throw new AppError('Inquiry not found.', StatusCodes.NOT_FOUND);
    }

    return prisma.enquiry.update({
      where: { id: enquiry.id },
      data: { isRead: true },
    });
  }

  /**
   * Review submission.
   */
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
        link: `/dashboard/account-manager/profile`,
      },
    });

    return review;
  }

  /**
   * Reviews listing.
   */
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

  /**
   * Inquiries submission.
   */
  async sendEnquiry(
    amId: string,
    data: { name: string; email: string; phone?: string; message: string },
    currentUserId?: string
  ) {
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
        link: `/dashboard/account-manager/enquiries`,
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

  /**
   * Deprecated wrappers for backward compatibility.
   */
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
        expertise: Array.isArray(data.expertise) ? data.expertise : [data.expertise].filter(Boolean),
        languages: Array.isArray(data.languages) ? data.languages : [data.languages].filter(Boolean),
        country: data.country,
        city: data.city,
        yearsExperience: data.yearsExperience ? parseInt(data.yearsExperience, 10) : undefined,
        services: Array.isArray(data.services) ? data.services : [data.services].filter(Boolean),
        availability: data.availability,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        status: ApprovalStatus.PENDING,
        onboardingStatus: OnboardingStatus.DRAFT,
      },
    });

    return am;
  }

  async updateAccountManager(userId: string, data: any, photoFile?: Express.Multer.File) {
    return this.saveSection(userId, 'about', data);
  }
}

export const accountManagerService = new AccountManagerService();
