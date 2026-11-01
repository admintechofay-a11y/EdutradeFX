import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { StatusCodes } from 'http-status-codes';
import path from 'path';
import {
  uploadBufferToCloudinary,
  generateSignedDocumentUrl,
} from '../../utils/cloudinary.utils';
import { verifyDocumentMagicBytes } from '../../middleware/upload.middleware';
import { ModerationStatus } from '@prisma/client';

export class ProviderDocsService {
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
   * Appends daysToExpiry and isExpired calculations to document records.
   */
  private enrichWithExpiry(doc: any) {
    let daysToExpiry: number | null = null;
    let isExpired = false;

    if (doc.expiryDate) {
      const now = Date.now();
      const expTime = new Date(doc.expiryDate).getTime();
      const diffMs = expTime - now;
      daysToExpiry = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      isExpired = daysToExpiry < 0;
    }

    return {
      ...doc,
      daysToExpiry,
      isExpired,
    };
  }

  async getDocuments(userId: string) {
    const providerId = await this.getProviderId(userId);
    const docs = await prisma.providerDocument.findMany({
      where: { providerId },
      orderBy: { createdAt: 'desc' },
    });

    return docs.map((d: any) => this.enrichWithExpiry(d));
  }

  async createDocument(userId: string, data: any) {
    const providerId = await this.getProviderId(userId);
    const { issueDate, expiryDate, ...rest } = data;

    const doc = await prisma.providerDocument.create({
      data: {
        ...rest,
        providerId,
        reviewStatus: ModerationStatus.PENDING,
        issueDate: issueDate ? new Date(issueDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      },
    });

    return this.enrichWithExpiry(doc);
  }

  async updateDocument(userId: string, documentId: string, data: any) {
    const providerId = await this.getProviderId(userId);
    const existing = await prisma.providerDocument.findFirst({
      where: { id: documentId, providerId },
      select: { id: true },
    });
    if (!existing) throw new AppError('Document not found.', StatusCodes.NOT_FOUND);

    const { issueDate, expiryDate, ...rest } = data;

    const doc = await prisma.providerDocument.update({
      where: { id: documentId },
      data: {
        ...rest,
        ...(issueDate !== undefined && { issueDate: issueDate ? new Date(issueDate) : null }),
        ...(expiryDate !== undefined && { expiryDate: expiryDate ? new Date(expiryDate) : null }),
        updatedAt: new Date(),
      },
    });

    return this.enrichWithExpiry(doc);
  }

  async deleteDocument(userId: string, documentId: string) {
    const providerId = await this.getProviderId(userId);
    const existing = await prisma.providerDocument.findFirst({
      where: { id: documentId, providerId },
      select: { id: true },
    });
    if (!existing) throw new AppError('Document not found.', StatusCodes.NOT_FOUND);

    return prisma.providerDocument.delete({
      where: { id: documentId },
    });
  }

  /**
   * Uploads sensitive verification document to authenticated storage in Cloudinary.
   */
  async uploadDocumentFile(userId: string, file: Express.Multer.File, meta: any) {
    if (!file || !file.buffer) {
      throw new AppError('No document file uploaded.', StatusCodes.BAD_REQUEST);
    }

    const ext = path.extname(file.originalname).toLowerCase();
    if (!verifyDocumentMagicBytes(file.buffer, ext)) {
      throw new AppError('Invalid document format or corrupt file header.', StatusCodes.BAD_REQUEST);
    }

    const providerId = await this.getProviderId(userId);

    const uploadRes = await uploadBufferToCloudinary(file.buffer, {
      folder: 'edutradefx/providers/documents',
      publicIdPrefix: `doc_${providerId}`,
      resourceType: 'auto',
      type: 'authenticated', // Private authenticated storage
    });

    const doc = await prisma.providerDocument.create({
      data: {
        providerId,
        kind: meta.kind || 'FILE',
        group: meta.group || 'DOCUMENT',
        docType: meta.docType || 'VERIFICATION_DOCUMENT',
        name: meta.name || file.originalname,
        issuingAuthority: meta.issuingAuthority || null,
        registrationNumber: meta.registrationNumber || null,
        issueDate: meta.issueDate ? new Date(meta.issueDate) : null,
        expiryDate: meta.expiryDate ? new Date(meta.expiryDate) : null,
        fileUrl: uploadRes.secure_url,
        publicId: uploadRes.public_id,
        visibility: meta.visibility || 'PRIVATE',
        requiredForVerification: meta.requiredForVerification ?? true,
        reviewStatus: ModerationStatus.PENDING,
      },
    });

    return this.enrichWithExpiry(doc);
  }

  /**
   * Generates a signed URL expiring in <= 5 minutes for authenticated document.
   */
  async getSignedUrl(userId: string, documentId: string, isAdmin = false, adminId?: string) {
    let whereClause: any = { id: documentId };
    if (!isAdmin) {
      const providerId = await this.getProviderId(userId);
      whereClause.providerId = providerId;
    }

    const doc = await prisma.providerDocument.findFirst({
      where: whereClause,
      select: { id: true, name: true, publicId: true, providerId: true },
    });

    if (!doc || !doc.publicId) {
      throw new AppError('Document not found or missing asset ID.', StatusCodes.NOT_FOUND);
    }

    const signedUrl = generateSignedDocumentUrl(doc.publicId, 'raw', 300);

    // Audit log for admin document access
    if (isAdmin && adminId) {
      await prisma.auditLog.create({
        data: {
          actorId: adminId,
          action: 'ACCESS_PROVIDER_DOCUMENT',
          targetType: 'PROVIDER_DOCUMENT',
          targetId: doc.id,
          metadata: {
            documentName: doc.name,
            providerId: doc.providerId,
            expiresInSeconds: 300,
          },
        },
      });
    }

    return {
      documentId: doc.id,
      name: doc.name,
      signedUrl,
      expiresInSeconds: 300,
    };
  }
}

export const providerDocsService = new ProviderDocsService();
