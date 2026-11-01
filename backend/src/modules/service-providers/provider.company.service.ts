import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { StatusCodes } from 'http-status-codes';
import path from 'path';
import { uploadBufferToCloudinary } from '../../utils/cloudinary.utils';
import {
  verifyImageMagicBytes,
  verifyDocumentMagicBytes,
} from '../../middleware/upload.middleware';
import { calculateOverallCompletion } from './provider.utils';

export class ProviderCompanyService {
  /**
   * Retrieves the authenticated provider's company profile and related models.
   */
  async getMyProfile(userId: string) {
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId },
      include: {
        contacts: { orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }] },
        addresses: { orderBy: { createdAt: 'asc' } },
        socialLinks: { orderBy: { createdAt: 'asc' } },
        categorySelections: {
          where: { isSelected: true },
          include: {
            category: {
              select: {
                id: true,
                number: true,
                name: true,
                slug: true,
                icon: true,
                shortDescription: true,
              },
            },
            subcategory: {
              select: {
                id: true,
                key: true,
                label: true,
              },
            },
          },
          orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
        },
      },
    });

    if (!provider) {
      throw new AppError('Solutions Provider profile not found for this user.', StatusCodes.NOT_FOUND);
    }

    return provider;
  }

  /**
   * Updates company identity (Form 2) and commercial terms (Form 6),
   * syncing contacts, addresses, and social links.
   */
  async updateMyProfile(userId: string, data: any) {
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!provider) {
      throw new AppError('Solutions Provider profile not found for this user.', StatusCodes.NOT_FOUND);
    }

    const { contacts, addresses, socialLinks, ...profileFields } = data;

    await prisma.$transaction(async (tx) => {
      // 1. Update core provider fields
      await tx.serviceProvider.update({
        where: { id: provider.id },
        data: {
          ...profileFields,
          lastActivityAt: new Date(),
        },
      });

      // 2. Sync contacts if provided
      if (Array.isArray(contacts)) {
        await tx.providerContact.deleteMany({
          where: { providerId: provider.id },
        });

        if (contacts.length > 0) {
          await tx.providerContact.createMany({
            data: contacts.map((c: any, index: number) => ({
              providerId: provider.id,
              fullName: c.fullName,
              jobTitle: c.jobTitle || null,
              email: c.email,
              phone: c.phone || null,
              isPrimary: c.isPrimary ?? (index === 0),
              isPublic: c.isPublic ?? false,
            })),
          });
        }
      }

      // 3. Sync addresses if provided
      if (Array.isArray(addresses)) {
        await tx.providerAddress.deleteMany({
          where: { providerId: provider.id },
        });

        if (addresses.length > 0) {
          await tx.providerAddress.createMany({
            data: addresses.map((a: any) => ({
              providerId: provider.id,
              type: a.type || 'OFFICE',
              label: a.label || null,
              line1: a.line1,
              line2: a.line2 || null,
              countryCode: a.countryCode,
              stateCode: a.stateCode || null,
              stateName: a.stateName || null,
              city: a.city,
              postalCode: a.postalCode || null,
              isPrivate: a.isPrivate ?? false,
            })),
          });
        }
      }

      // 4. Sync social links if provided
      if (Array.isArray(socialLinks)) {
        await tx.providerSocialLink.deleteMany({
          where: { providerId: provider.id },
        });

        if (socialLinks.length > 0) {
          await tx.providerSocialLink.createMany({
            data: socialLinks.map((s: any) => ({
              providerId: provider.id,
              platform: s.platform,
              url: s.url,
            })),
          });
        }
      }
    });

    await calculateOverallCompletion(provider.id);
    return this.getMyProfile(userId);
  }

  /**
   * Uploads provider logo to Cloudinary with magic bytes verification.
   */
  async uploadLogo(userId: string, file: Express.Multer.File) {
    if (!file || !file.buffer) {
      throw new AppError('No logo image file uploaded.', StatusCodes.BAD_REQUEST);
    }

    if (!verifyImageMagicBytes(file.buffer)) {
      throw new AppError('File header does not match valid image format.', StatusCodes.BAD_REQUEST);
    }

    const provider = await prisma.serviceProvider.findUnique({
      where: { userId },
      select: { id: true, slug: true },
    });
    if (!provider) {
      throw new AppError('Solutions Provider profile not found.', StatusCodes.NOT_FOUND);
    }

    const uploadRes = await uploadBufferToCloudinary(file.buffer, {
      folder: 'edutradefx/providers/logos',
      publicIdPrefix: `logo_${provider.slug}`,
      resourceType: 'image',
    });

    const updated = await prisma.serviceProvider.update({
      where: { id: provider.id },
      data: { logo: uploadRes.secure_url },
      select: { id: true, logo: true },
    });

    return updated;
  }

  /**
   * Uploads provider cover banner to Cloudinary with magic bytes verification.
   */
  async uploadCover(userId: string, file: Express.Multer.File) {
    if (!file || !file.buffer) {
      throw new AppError('No cover image file uploaded.', StatusCodes.BAD_REQUEST);
    }

    if (!verifyImageMagicBytes(file.buffer)) {
      throw new AppError('File header does not match valid image format.', StatusCodes.BAD_REQUEST);
    }

    const provider = await prisma.serviceProvider.findUnique({
      where: { userId },
      select: { id: true, slug: true },
    });
    if (!provider) {
      throw new AppError('Solutions Provider profile not found.', StatusCodes.NOT_FOUND);
    }

    const uploadRes = await uploadBufferToCloudinary(file.buffer, {
      folder: 'edutradefx/providers/covers',
      publicIdPrefix: `cover_${provider.slug}`,
      resourceType: 'image',
    });

    const updated = await prisma.serviceProvider.update({
      where: { id: provider.id },
      data: { coverImage: uploadRes.secure_url },
      select: { id: true, coverImage: true },
    });

    return updated;
  }

  /**
   * Uploads company presentation deck to Cloudinary with magic bytes verification.
   */
  async uploadPresentation(userId: string, file: Express.Multer.File) {
    if (!file || !file.buffer) {
      throw new AppError('No presentation file uploaded.', StatusCodes.BAD_REQUEST);
    }

    const ext = path.extname(file.originalname).toLowerCase();
    if (!verifyDocumentMagicBytes(file.buffer, ext)) {
      throw new AppError('File header does not match valid document format.', StatusCodes.BAD_REQUEST);
    }

    const provider = await prisma.serviceProvider.findUnique({
      where: { userId },
      select: { id: true, slug: true },
    });
    if (!provider) {
      throw new AppError('Solutions Provider profile not found.', StatusCodes.NOT_FOUND);
    }

    const uploadRes = await uploadBufferToCloudinary(file.buffer, {
      folder: 'edutradefx/providers/presentations',
      publicIdPrefix: `presentation_${provider.slug}`,
      resourceType: 'auto',
    });

    const updated = await prisma.serviceProvider.update({
      where: { id: provider.id },
      data: {
        presentationUrl: uploadRes.secure_url,
        presentationPublicId: uploadRes.public_id,
      },
      select: { id: true, presentationUrl: true },
    });

    return updated;
  }
}

export const providerCompanyService = new ProviderCompanyService();
