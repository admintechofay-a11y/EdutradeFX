import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { parsePagination } from '../../utils/pagination.utils';
import { ContactEnquiryStatus, NotificationType, Prisma } from '@prisma/client';

export class ContactService {
  async createEnquiry(data: {
    name: string;
    email: string;
    phone?: string;
    category: string;
    subject: string;
    message: string;
  }) {
    const enquiry = await prisma.contactEnquiry.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone || null,
        category: data.category,
        subject: data.subject,
        message: data.message,
        status: ContactEnquiryStatus.PENDING,
      },
    });

    // Notify administrators
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: NotificationType.ENQUIRY,
          title: 'New Contact Enquiry',
          message: `Enquiry from ${data.name} [${data.category}]: "${data.subject}"`,
          link: `/admin/enquiries`,
        })),
      });
    }

    return enquiry;
  }

  async getAllEnquiries(query: any) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.ContactEnquiryWhereInput = {};
    if (query.status) {
      where.status = query.status as ContactEnquiryStatus;
    }
    if (query.category) {
      where.category = query.category;
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search as string, mode: 'insensitive' } },
        { email: { contains: query.search as string, mode: 'insensitive' } },
        { subject: { contains: query.search as string, mode: 'insensitive' } },
        { message: { contains: query.search as string, mode: 'insensitive' } },
      ];
    }

    const [enquiries, total] = await Promise.all([
      prisma.contactEnquiry.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contactEnquiry.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { enquiries, total, page, limit, totalPages };
  }

  async getEnquiryById(id: string) {
    const enquiry = await prisma.contactEnquiry.findUnique({ where: { id } });
    if (!enquiry) {
      throw new AppError('Contact enquiry not found.', StatusCodes.NOT_FOUND);
    }
    return enquiry;
  }

  async updateEnquiry(id: string, data: { status?: ContactEnquiryStatus; adminNotes?: string }) {
    const existing = await prisma.contactEnquiry.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Contact enquiry not found.', StatusCodes.NOT_FOUND);
    }

    return await prisma.contactEnquiry.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.adminNotes !== undefined && { adminNotes: data.adminNotes }),
      },
    });
  }

  async deleteEnquiry(id: string) {
    const existing = await prisma.contactEnquiry.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Contact enquiry not found.', StatusCodes.NOT_FOUND);
    }
    await prisma.contactEnquiry.delete({ where: { id } });
    return { message: 'Enquiry deleted successfully.' };
  }
}

export const contactService = new ContactService();
