import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { StatusCodes } from 'http-status-codes';
import { ModerationStatus } from '@prisma/client';
import { uploadBufferToCloudinary } from '../../utils/cloudinary.utils';
import { verifyImageMagicBytes } from '../../middleware/upload.middleware';

export class ProviderTeamService {
  private async getProviderId(userId: string): Promise<string> {
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!provider) {
      throw new AppError('Solutions Provider profile not found.', StatusCodes.NOT_FOUND);
    }
    return provider.id;
  }

  /**
   * Strips private fields (ownership percentage, private documents) for public view.
   */
  public sanitizeTeamMember(member: any, isOwnerOrAdmin = false) {
    if (isOwnerOrAdmin) return member;
    const { ownershipPercentage, evidenceDocId, ...safe } = member;
    return safe;
  }

  async getTeamMembers(userId: string) {
    const providerId = await this.getProviderId(userId);
    return prisma.providerTeamMember.findMany({
      where: { providerId },
      include: {
        associatedProducts: {
          include: {
            product: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async createTeamMember(userId: string, data: any) {
    const providerId = await this.getProviderId(userId);
    const { productIds, ...memberFields } = data;

    const member = await prisma.providerTeamMember.create({
      data: {
        ...memberFields,
        providerId,
        reviewStatus: ModerationStatus.PENDING,
        ...(Array.isArray(productIds) && productIds.length > 0 && {
          associatedProducts: {
            createMany: {
              data: productIds.map((pId: string) => ({ productId: pId })),
            },
          },
        }),
      },
      include: {
        associatedProducts: {
          include: {
            product: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    return member;
  }

  async updateTeamMember(userId: string, memberId: string, data: any) {
    const providerId = await this.getProviderId(userId);
    const existing = await prisma.providerTeamMember.findFirst({
      where: { id: memberId, providerId },
      select: { id: true },
    });
    if (!existing) throw new AppError('Team member not found.', StatusCodes.NOT_FOUND);

    const { productIds, ...memberFields } = data;

    const member = await prisma.$transaction(async (tx) => {
      if (Array.isArray(productIds)) {
        await tx.teamMemberProduct.deleteMany({
          where: { teamMemberId: memberId },
        });
        if (productIds.length > 0) {
          await tx.teamMemberProduct.createMany({
            data: productIds.map((pId: string) => ({
              teamMemberId: memberId,
              productId: pId,
            })),
          });
        }
      }

      return tx.providerTeamMember.update({
        where: { id: memberId },
        data: {
          ...memberFields,
          updatedAt: new Date(),
        },
        include: {
          associatedProducts: {
            include: {
              product: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      });
    });

    return member;
  }

  async deleteTeamMember(userId: string, memberId: string) {
    const providerId = await this.getProviderId(userId);
    const existing = await prisma.providerTeamMember.findFirst({
      where: { id: memberId, providerId },
      select: { id: true },
    });
    if (!existing) throw new AppError('Team member not found.', StatusCodes.NOT_FOUND);

    return prisma.providerTeamMember.delete({
      where: { id: memberId },
    });
  }

  async uploadPhoto(userId: string, memberId: string, file: Express.Multer.File) {
    if (!file || !file.buffer) {
      throw new AppError('No photo file provided.', StatusCodes.BAD_REQUEST);
    }
    if (!verifyImageMagicBytes(file.buffer)) {
      throw new AppError('Invalid image format.', StatusCodes.BAD_REQUEST);
    }

    const providerId = await this.getProviderId(userId);
    const existing = await prisma.providerTeamMember.findFirst({
      where: { id: memberId, providerId },
      select: { id: true },
    });
    if (!existing) throw new AppError('Team member not found.', StatusCodes.NOT_FOUND);

    const uploadRes = await uploadBufferToCloudinary(file.buffer, {
      folder: 'edutradefx/providers/team',
      publicIdPrefix: `team_${memberId}`,
      resourceType: 'image',
    });

    return prisma.providerTeamMember.update({
      where: { id: memberId },
      data: {
        photoUrl: uploadRes.secure_url,
        photoPublicId: uploadRes.public_id,
      },
      select: { id: true, photoUrl: true },
    });
  }
}

export const providerTeamService = new ProviderTeamService();

