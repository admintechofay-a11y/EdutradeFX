import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { parsePagination } from '../../utils/pagination.utils';
import { ComplaintStatus, NotificationType, Prisma } from '@prisma/client';

export class ComplaintService {
  async submitComplaint(userId: string | null | undefined, data: any, files?: Express.Multer.File[]) {
    const attachmentUrls = files && files.length > 0
      ? files.map((f) => (f as any).path || (f as any).secure_url || f.filename)
      : [];

    const complaint = await prisma.complaint.create({
      data: {
        userId: userId || null,
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone || null,
        companyName: data.companyName || null,
        category: data.category || null,
        targetType: data.targetType,
        targetId: data.targetId || null,
        subject: data.subject,
        description: data.description,
        attachments: attachmentUrls,
        declarationConsent: data.declarationConsent !== undefined ? Boolean(data.declarationConsent) : true,
        status: ComplaintStatus.OPEN,
      },
    });

    // Notify administrators
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: NotificationType.ALERT,
          title: 'New Dispute/Complaint Submitted',
          message: `Dispute filed against ${data.targetType}: "${data.subject}"`,
          link: `/admin/complaints/${complaint.id}`,
        })),
      });
    }

    return complaint;
  }

  async getMyComplaints(userId: string, query: any) {
    const { skip, take, page, limit } = parsePagination(query);

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.complaint.count({ where: { userId } }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { complaints, total, page, limit, totalPages };
  }

  async getComplaintById(id: string, userId: string, role: string) {
    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    if (!complaint) {
      throw new AppError('Dispute record not found.', StatusCodes.NOT_FOUND);
    }

    if (role !== 'ADMIN' && complaint.userId !== userId) {
      throw new AppError('Access denied.', StatusCodes.FORBIDDEN);
    }

    return complaint;
  }

  async updateComplaint(id: string, adminId: string, data: any) {
    const complaint = await prisma.complaint.findUnique({ where: { id } });
    if (!complaint) {
      throw new AppError('Complaint not found.', StatusCodes.NOT_FOUND);
    }

    const isResolving =
      (data.status === ComplaintStatus.RESOLVED || data.status === ComplaintStatus.CLOSED) &&
      complaint.status !== ComplaintStatus.RESOLVED &&
      complaint.status !== ComplaintStatus.CLOSED;

    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.assignedTo !== undefined && { assignedTo: data.assignedTo }),
        ...(data.adminNotes !== undefined && { adminNotes: data.adminNotes }),
        ...(data.resolution !== undefined && { resolution: data.resolution }),
        ...(isResolving && { resolvedAt: new Date() }),
      },
    });

    // Notify user of update if registered
    if (complaint.userId) {
      await prisma.notification.create({
        data: {
          userId: complaint.userId,
          type: data.status === ComplaintStatus.RESOLVED ? NotificationType.SUCCESS : NotificationType.INFO,
          title: `Complaint Status Updated: ${data.status || 'Updated'}`,
          message: `Your complaint "${complaint.subject}" status was changed to ${data.status}.`,
          link: `/dashboard/complaints/${complaint.id}`,
        },
      });
    }

    return updated;
  }

  async getAllComplaintsAdmin(query: any) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.ComplaintWhereInput = {};
    if (query.status) {
      where.status = query.status as ComplaintStatus;
    }
    if (query.targetType) {
      where.targetType = query.targetType;
    }
    if (query.search) {
      where.OR = [
        { subject: { contains: query.search as string, mode: 'insensitive' } },
        { description: { contains: query.search as string, mode: 'insensitive' } },
      ];
    }

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.complaint.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { complaints, total, page, limit, totalPages };
  }
}

export const complaintService = new ComplaintService();
