import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { StatusCodes } from 'http-status-codes';
import {
  ProviderStatus,
  ProviderCategoryStatus,
  ProductStatus,
  ModerationStatus,
  ProviderVerificationStatus,
} from '@prisma/client';
import { providerPublishService } from './provider.publish.service';
import {
  sendApprovalEmail,
  sendRejectionEmail,
  sendChangesRequestedEmail,
} from '../../utils/email.utils';

export class ProviderAdminService {
  /**
   * List providers with admin filters & review flags
   */
  async listProviders(filters: any = {}) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.verificationStatus) where.verificationStatus = filters.verificationStatus;
    if (filters.search) {
      const q = filters.search.trim();
      where.OR = [
        { brandName: { contains: q, mode: 'insensitive' } },
        { legalName: { contains: q, mode: 'insensitive' } },
        { providerCode: { contains: q, mode: 'insensitive' } },
        { applicationRef: { contains: q, mode: 'insensitive' } },
        { companyEmail: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (filters.categoryNumber) {
      where.categorySelections = {
        some: {
          category: { number: Number(filters.categoryNumber) },
          isSelected: true,
        },
      };
    }

    const [total, providers] = await Promise.all([
      prisma.serviceProvider.count({ where }),
      prisma.serviceProvider.findMany({
        where,
        include: {
          categorySelections: {
            where: { isSelected: true },
            include: { category: { select: { number: true, name: true } } },
          },
          _count: {
            select: { products: true, teamMembers: true, documents: true },
          },
        },
        orderBy: [{ submittedAt: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
    ]);

    return {
      items: providers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Complete provider admin review dossier
   */
  async getProviderDetails(providerId: string) {
    const provider = await prisma.serviceProvider.findUnique({
      where: { id: providerId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        contacts: true,
        addresses: true,
        socialLinks: true,
        categorySelections: {
          include: {
            category: true,
            subcategory: true,
          },
        },
        products: {
          include: {
            categoryLinks: { include: { category: true } },
            categoryDetails: true,
            technicalSpec: true,
            integration: true,
            pricing: true,
            media: true,
            documents: true,
          },
        },
        teamMembers: {
          include: { associatedProducts: { include: { product: true } } },
        },
        documents: true,
        verifications: { orderBy: { createdAt: 'desc' } },
        featuredPlacements: true,
      },
    });

    if (!provider) throw new AppError('Provider not found.', StatusCodes.NOT_FOUND);
    return provider;
  }

  /**
   * Status change: APPROVE, REJECT, REQUEST_CHANGES, SUSPEND
   */
  async updateStatus(
    providerId: string,
    status: ProviderStatus,
    note: string | undefined,
    adminId: string
  ) {
    const provider = await prisma.serviceProvider.findUnique({
      where: { id: providerId },
      select: {
        id: true,
        status: true,
        brandName: true,
        legalName: true,
        companyEmail: true,
        user: { select: { email: true, name: true } },
      },
    });
    if (!provider) throw new AppError('Provider not found.', StatusCodes.NOT_FOUND);

    if (
      (status === ProviderStatus.REJECTED || status === ProviderStatus.CHANGES_REQUESTED) &&
      (!note || !note.trim())
    ) {
      throw new AppError(
        'A reason/note is required when rejecting or requesting changes.',
        StatusCodes.BAD_REQUEST
      );
    }

    const updated = await prisma.serviceProvider.update({
      where: { id: providerId },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedById: adminId,
        ...(status === ProviderStatus.REJECTED && { rejectionReason: note }),
        ...(status === ProviderStatus.CHANGES_REQUESTED && { changesRequestedNote: note }),
        ...(status === ProviderStatus.SUSPENDED && {
          suspendedAt: new Date(),
          suspensionReason: note || null,
        }),
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: `PROVIDER_STATUS_${status}`,
        targetType: 'SERVICE_PROVIDER',
        targetId: providerId,
        metadata: { oldStatus: provider.status, newStatus: status, note },
      },
    });

    // Notify provider safely via email
    const recipientName = provider.brandName || provider.legalName || provider.user?.name || 'Solutions Provider';
    const recipientEmail = provider.companyEmail || provider.user?.email;
    if (recipientEmail) {
      if (status === ProviderStatus.APPROVED) {
        await sendApprovalEmail(recipientEmail, recipientName, 'Solutions Provider').catch(() => {});
      } else if (status === ProviderStatus.REJECTED) {
        await sendRejectionEmail(recipientEmail, recipientName, 'Solutions Provider', note).catch(() => {});
      } else if (status === ProviderStatus.CHANGES_REQUESTED) {
        await sendChangesRequestedEmail(recipientEmail, recipientName, 'Solutions Provider', note || '').catch(() => {});
      }
    }

    await providerPublishService.rebuildPublishedProvider(providerId);
    return updated;
  }

  /**
   * Granular approval for Category Selection
   */
  async updateCategoryStatus(
    selectionId: string,
    status: ProviderCategoryStatus,
    note: string | undefined,
    adminId: string
  ) {
    const selection = await prisma.providerCategorySelection.findUnique({
      where: { id: selectionId },
      select: { id: true, providerId: true },
    });
    if (!selection) throw new AppError('Category selection not found.', StatusCodes.NOT_FOUND);

    const updated = await prisma.providerCategorySelection.update({
      where: { id: selectionId },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedById: adminId,
        ...(status === ProviderCategoryStatus.REJECTED && { rejectionReason: note }),
        ...(status === ProviderCategoryStatus.CHANGES_REQUESTED && { changesRequestedNote: note }),
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: `PROVIDER_CATEGORY_${status}`,
        targetType: 'PROVIDER_CATEGORY_SELECTION',
        targetId: selectionId,
        metadata: { status, note },
      },
    });

    await providerPublishService.rebuildPublishedProvider(selection.providerId);
    return updated;
  }

  /**
   * Granular approval for Product
   */
  async updateProductStatus(
    productId: string,
    status: ProductStatus,
    note: string | undefined,
    adminId: string
  ) {
    const product = await prisma.serviceProviderProduct.findUnique({
      where: { id: productId },
      select: { id: true, providerId: true },
    });
    if (!product) throw new AppError('Product not found.', StatusCodes.NOT_FOUND);

    const updated = await prisma.serviceProviderProduct.update({
      where: { id: productId },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedById: adminId,
        ...(status === ProductStatus.REJECTED && { rejectionReason: note }),
        ...(status === ProductStatus.CHANGES_REQUESTED && { changesRequestedNote: note }),
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: `PRODUCT_STATUS_${status}`,
        targetType: 'SERVICE_PROVIDER_PRODUCT',
        targetId: productId,
        metadata: { status, note },
      },
    });

    await providerPublishService.rebuildPublishedProvider(product.providerId);
    return updated;
  }

  /**
   * Toggle verifiable claim on Category Selection or Product
   */
  async toggleClaimVerification(
    targetType: 'CATEGORY' | 'PRODUCT',
    targetId: string,
    claimKey: string,
    verified: boolean,
    adminId: string
  ) {
    let providerId = '';

    if (targetType === 'CATEGORY') {
      const selection = await prisma.providerCategorySelection.findUnique({
        where: { id: targetId },
        select: { id: true, providerId: true, verifiedClaims: true },
      });
      if (!selection) throw new AppError('Category selection not found.', StatusCodes.NOT_FOUND);
      providerId = selection.providerId;

      let claims = selection.verifiedClaims || [];
      if (verified && !claims.includes(claimKey)) {
        claims = [...claims, claimKey];
      } else if (!verified) {
        claims = claims.filter((k) => k !== claimKey);
      }

      await prisma.providerCategorySelection.update({
        where: { id: targetId },
        data: { verifiedClaims: claims },
      });
    } else {
      const product = await prisma.serviceProviderProduct.findUnique({
        where: { id: targetId },
        select: { id: true, providerId: true, verifiedClaims: true },
      });
      if (!product) throw new AppError('Product not found.', StatusCodes.NOT_FOUND);
      providerId = product.providerId;

      let claims = product.verifiedClaims || [];
      if (verified && !claims.includes(claimKey)) {
        claims = [...claims, claimKey];
      } else if (!verified) {
        claims = claims.filter((k) => k !== claimKey);
      }

      await prisma.serviceProviderProduct.update({
        where: { id: targetId },
        data: { verifiedClaims: claims },
      });
    }

    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: verified ? 'VERIFY_CLAIM' : 'UNVERIFY_CLAIM',
        targetType: `PROVIDER_${targetType}`,
        targetId,
        metadata: { claimKey, verified },
      },
    });

    await providerPublishService.rebuildPublishedProvider(providerId);
    return { success: true, claimKey, verified };
  }

  /**
   * Toggle Verified Provider badge
   */
  async toggleVerifiedBadge(providerId: string, verified: boolean, note: string | undefined, adminId: string) {
    const provider = await prisma.serviceProvider.findUnique({
      where: { id: providerId },
      select: { id: true },
    });
    if (!provider) throw new AppError('Provider not found.', StatusCodes.NOT_FOUND);

    const updated = await prisma.serviceProvider.update({
      where: { id: providerId },
      data: {
        verificationStatus: verified
          ? ProviderVerificationStatus.VERIFIED
          : ProviderVerificationStatus.REJECTED,
        verifiedAt: verified ? new Date() : null,
        verifiedById: verified ? adminId : null,
      },
    });

    await prisma.providerVerification.create({
      data: {
        providerId,
        status: verified
          ? ProviderVerificationStatus.VERIFIED
          : ProviderVerificationStatus.REJECTED,
        note: note || (verified ? 'Verified badge awarded by admin' : 'Verified badge revoked'),
        actorId: adminId,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: verified ? 'GRANT_VERIFIED_BADGE' : 'REVOKE_VERIFIED_BADGE',
        targetType: 'SERVICE_PROVIDER',
        targetId: providerId,
        metadata: { verified, note },
      },
    });

    await providerPublishService.rebuildPublishedProvider(providerId);
    return updated;
  }

  /**
   * Moderate user review
   */
  async moderateReview(
    reviewId: string,
    status: ModerationStatus,
    note: string | undefined,
    adminId: string
  ) {
    const review = await prisma.providerReview.findUnique({
      where: { id: reviewId },
      select: { id: true, providerId: true },
    });
    if (!review) throw new AppError('Review not found.', StatusCodes.NOT_FOUND);

    const updated = await prisma.providerReview.update({
      where: { id: reviewId },
      data: {
        status,
        moderatedById: adminId,
        moderationNote: note || null,
      },
    });

    // Recompute provider rating aggregates
    const reviews = await prisma.providerReview.findMany({
      where: { providerId: review.providerId, status: ModerationStatus.APPROVED },
      select: { rating: true },
    });

    const totalReviews = reviews.length;
    const avgRating =
      totalReviews > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
        : 0;

    await prisma.serviceProvider.update({
      where: { id: review.providerId },
      data: {
        totalReviews,
        avgRating,
      },
    });

    await providerPublishService.rebuildPublishedProvider(review.providerId);
    return updated;
  }
}

export const providerAdminService = new ProviderAdminService();
