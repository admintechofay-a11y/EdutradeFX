import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { generateUniqueSlug } from '../../utils/slug.utils';
import { parsePagination } from '../../utils/pagination.utils';
import { createRazorpayOrder, verifyRazorpaySignature } from '../../config/razorpay';
import { sendEnrollmentConfirmation } from '../../utils/email.utils';
import {
  ApprovalStatus,
  CourseStatus,
  NotificationType,
  OrderStatus,
  PayoutStatus,
  Prisma,
} from '@prisma/client';

export class LMSService {
  // ── TUTOR PROFILE ──────────────────────────────────────────

  async registerTutor(userId: string, data: any, photoFile?: Express.Multer.File, docFiles?: Express.Multer.File[]) {
    const existing = await prisma.tutor.findUnique({ where: { userId } });
    if (existing) {
      throw new AppError('A tutor profile is already registered for this account.', StatusCodes.CONFLICT);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const slug = await generateUniqueSlug(user ? user.name : 'tutor', 'tutor');
    const photoUrl = photoFile ? (photoFile as any).path || (photoFile as any).secure_url : undefined;

    const tutor = await prisma.tutor.create({
      data: {
        userId,
        slug,
        photo: photoUrl,
        bio: data.bio,
        expertise: Array.isArray(data.expertise) ? data.expertise : [data.expertise],
        bankDetails: data.bankDetails || undefined,
        status: ApprovalStatus.PENDING,
      },
    });

    if (docFiles && docFiles.length > 0) {
      await prisma.tutorDocument.createMany({
        data: docFiles.map((f) => ({
          tutorId: tutor.id,
          fileUrl: (f as any).path || (f as any).secure_url || f.filename,
          fileName: f.originalname,
          docType: 'INSTRUCTOR_CREDENTIAL',
        })),
      });
    }

    // Notify admins
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((a) => ({
          userId: a.id,
          type: NotificationType.APPROVAL,
          title: 'New Tutor Registration',
          message: `${user?.name || 'A user'} applied as a Course Instructor.`,
          link: `/admin/tutors/${tutor.id}`,
        })),
      });
    }

    return tutor;
  }

  async getMyTutorProfile(userId: string) {
    const tutor = await prisma.tutor.findUnique({
      where: { userId },
      include: {
        documents: true,
        courses: {
          orderBy: { createdAt: 'desc' },
          include: {
            _count: { select: { enrollments: true, reviews: true } },
          },
        },
        payouts: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    if (!tutor) {
      throw new AppError('Tutor profile not found.', StatusCodes.NOT_FOUND);
    }

    return tutor;
  }

  // ── COURSE MANAGEMENT ──────────────────────────────────────

  async createCourse(userId: string, data: any, thumbFile?: Express.Multer.File, promoFile?: Express.Multer.File) {
    let tutor = await prisma.tutor.findUnique({ where: { userId } });
    if (!tutor) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user && (user.role === 'ADMIN' || user.role === 'TUTOR')) {
        const slug = await generateUniqueSlug(user.name, 'tutor');
        tutor = await prisma.tutor.create({
          data: {
            userId,
            slug,
            bio: `${user.name} - Trading Instructor`,
            expertise: [data.category || 'Forex Trading'],
            status: ApprovalStatus.APPROVED,
          },
        });
      } else {
        throw new AppError('Tutor profile not found. Please register as a tutor first.', StatusCodes.FORBIDDEN);
      }
    }

    if (tutor.status !== ApprovalStatus.APPROVED) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
      if (user?.role === 'ADMIN') {
        tutor = await prisma.tutor.update({
          where: { id: tutor.id },
          data: { status: ApprovalStatus.APPROVED },
        });
      } else {
        throw new AppError('Your instructor profile is pending verification. Courses can only be created once approved.', StatusCodes.FORBIDDEN);
      }
    }

    const slug = await generateUniqueSlug(data.title, 'course');
    const thumbnailUrl = thumbFile ? (thumbFile as any).path || (thumbFile as any).secure_url : undefined;
    const promoVideoUrl = promoFile ? (promoFile as any).path || (promoFile as any).secure_url : undefined;

    return await prisma.course.create({
      data: {
        tutorId: tutor.id,
        title: data.title,
        slug,
        shortDescription: data.shortDescription,
        description: data.description,
        category: data.category,
        level: data.level,
        thumbnail: thumbnailUrl,
        promoVideo: promoVideoUrl,
        price: parseFloat(data.price),
        discountPrice: data.discountPrice ? parseFloat(data.discountPrice) : undefined,
        discountUntil: data.discountUntil ? new Date(data.discountUntil) : undefined,
        currency: data.currency || 'INR',
        prerequisites: data.prerequisites ? (Array.isArray(data.prerequisites) ? data.prerequisites : [data.prerequisites]) : [],
        learningOutcomes:
          Array.isArray(data.learningOutcomes) && data.learningOutcomes.length > 0
            ? data.learningOutcomes
            : [
                'Master key chart analysis and market structure execution',
                'Implement sound risk management and capital preservation',
                'Develop trading discipline and strategic consistency',
              ],
        language: data.language || 'English',
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        status: CourseStatus.DRAFT,
      },
    });
  }

  async getMyCourses(userId: string) {
    let tutor = await prisma.tutor.findUnique({ where: { userId } });
    if (!tutor) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user && (user.role === 'ADMIN' || user.role === 'TUTOR')) {
        const slug = await generateUniqueSlug(user.name, 'tutor');
        tutor = await prisma.tutor.create({
          data: {
            userId,
            slug,
            bio: `${user.name} - Trading Instructor`,
            expertise: ['Forex Trading'],
            status: ApprovalStatus.APPROVED,
          },
        });
      } else {
        return [];
      }
    }

    return await prisma.course.findMany({
      where: { tutorId: tutor.id },
      include: {
        _count: {
          select: {
            enrollments: true,
            sections: true,
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateCourse(courseId: string, userId: string, data: any, thumbFile?: Express.Multer.File, promoFile?: Express.Multer.File) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    const isAdmin = user?.role === 'ADMIN';
    const tutor = await prisma.tutor.findUnique({ where: { userId } });
    if (!tutor && !isAdmin) {
      throw new AppError('Unauthorized.', StatusCodes.FORBIDDEN);
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || (!isAdmin && course.tutorId !== tutor?.id)) {
      throw new AppError('Course not found or unauthorized.', StatusCodes.FORBIDDEN);
    }

    const thumbnailUrl = thumbFile ? (thumbFile as any).path || (thumbFile as any).secure_url : course.thumbnail;
    const promoVideoUrl = promoFile ? (promoFile as any).path || (promoFile as any).secure_url : course.promoVideo;

    // Course Content Moderation: If a published course alters sensitive content (title, price, description, promo), move to REVIEW
    const hasSensitiveChanges = Boolean(
      (data.title && data.title !== course.title) ||
      (data.price !== undefined && parseFloat(data.price) !== course.price) ||
      (data.description !== undefined && data.description !== course.description) ||
      (promoVideoUrl && promoVideoUrl !== course.promoVideo)
    );

    const newStatus = (course.status === CourseStatus.PUBLISHED && hasSensitiveChanges)
      ? CourseStatus.REVIEW
      : course.status;

    return await prisma.course.update({
      where: { id: courseId },
      data: {
        status: newStatus,
        ...(thumbnailUrl && { thumbnail: thumbnailUrl }),
        ...(promoVideoUrl && { promoVideo: promoVideoUrl }),
        ...(data.title && { title: data.title }),
        ...(data.shortDescription !== undefined && { shortDescription: data.shortDescription }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.category && { category: data.category }),
        ...(data.level && { level: data.level }),
        ...(data.price !== undefined && { price: parseFloat(data.price) }),
        ...(data.discountPrice !== undefined && { discountPrice: parseFloat(data.discountPrice) }),
        ...(data.discountUntil !== undefined && { discountUntil: new Date(data.discountUntil) }),
        ...(data.prerequisites && {
          prerequisites: Array.isArray(data.prerequisites) ? data.prerequisites : [data.prerequisites],
        }),
        ...(data.learningOutcomes && {
          learningOutcomes: Array.isArray(data.learningOutcomes) ? data.learningOutcomes : [data.learningOutcomes],
        }),
        ...(data.language && { language: data.language }),
        ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle }),
        ...(data.seoDescription !== undefined && { seoDescription: data.seoDescription }),
      },
    });
  }

  async deleteCourse(courseId: string, userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    const isAdmin = user?.role === 'ADMIN';
    const tutor = await prisma.tutor.findUnique({ where: { userId } });
    if (!tutor && !isAdmin) {
      throw new AppError('Unauthorized.', StatusCodes.FORBIDDEN);
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { _count: { select: { enrollments: true } } },
    });

    if (!course || (!isAdmin && course.tutorId !== tutor?.id)) {
      throw new AppError('Course not found or unauthorized.', StatusCodes.FORBIDDEN);
    }

    if (course.status === CourseStatus.PUBLISHED && course._count.enrollments > 0) {
      throw new AppError('Published courses with active student enrollments cannot be deleted. You may archive it instead.', StatusCodes.BAD_REQUEST);
    }

    await prisma.course.delete({ where: { id: courseId } });
    return { message: 'Course deleted successfully.' };
  }

  async submitCourseForReview(courseId: string, userId: string) {
    const tutor = await prisma.tutor.findUnique({ where: { userId } });
    if (!tutor) throw new AppError('Unauthorized', StatusCodes.FORBIDDEN);

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        sections: { include: { lessons: true } },
      },
    });

    if (!course || course.tutorId !== tutor.id) {
      throw new AppError('Course not found.', StatusCodes.NOT_FOUND);
    }

    if (course.sections.length === 0) {
      throw new AppError('The course curriculum must have at least one section before submission.', StatusCodes.BAD_REQUEST);
    }

    const totalLessons = course.sections.reduce((acc, s) => acc + s.lessons.length, 0);
    if (totalLessons === 0) {
      throw new AppError('The course must contain at least one lesson before submitting for review.', StatusCodes.BAD_REQUEST);
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: { status: CourseStatus.REVIEW },
    });

    // Notify Admins
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: NotificationType.APPROVAL,
          title: 'Course Awaiting Review',
          message: `"${course.title}" was submitted for publication approval.`,
          link: `/admin/courses/${course.id}`,
        })),
      });
    }

    return updated;
  }

  // ── SECTIONS & LESSONS ──────────────────────────────────────

  async createSection(courseId: string, userId: string, data: { title: string; order?: number }) {
    const tutor = await prisma.tutor.findUnique({ where: { userId } });
    if (!tutor) throw new AppError('Unauthorized', StatusCodes.FORBIDDEN);

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.tutorId !== tutor.id) throw new AppError('Course not found', StatusCodes.NOT_FOUND);

    const sectionCount = await prisma.courseSection.count({ where: { courseId } });

    return await prisma.courseSection.create({
      data: {
        courseId,
        title: data.title,
        order: data.order || sectionCount + 1,
      },
    });
  }

  async updateSection(sectionId: string, userId: string, data: { title?: string; order?: number }) {
    const section = await prisma.courseSection.findUnique({
      where: { id: sectionId },
      include: { course: { include: { tutor: true } } },
    });

    if (!section || section.course.tutor.userId !== userId) {
      throw new AppError('Section not found or unauthorized.', StatusCodes.FORBIDDEN);
    }

    return await prisma.courseSection.update({
      where: { id: sectionId },
      data,
    });
  }

  async deleteSection(sectionId: string, userId: string) {
    const section = await prisma.courseSection.findUnique({
      where: { id: sectionId },
      include: { course: { include: { tutor: true } } },
    });

    if (!section || section.course.tutor.userId !== userId) {
      throw new AppError('Unauthorized.', StatusCodes.FORBIDDEN);
    }

    await prisma.courseSection.delete({ where: { id: sectionId } });
    return { message: 'Section removed successfully.' };
  }

  async createLesson(sectionId: string, userId: string, data: any, contentFile?: Express.Multer.File) {
    const section = await prisma.courseSection.findUnique({
      where: { id: sectionId },
      include: { course: { include: { tutor: true } } },
    });

    if (!section || section.course.tutor.userId !== userId) {
      throw new AppError('Section not found or unauthorized.', StatusCodes.FORBIDDEN);
    }

    const contentUrl = contentFile
      ? (contentFile as any).path || (contentFile as any).secure_url
      : data.contentUrl;

    const lessonCount = await prisma.lesson.count({ where: { sectionId } });

    const lesson = await prisma.lesson.create({
      data: {
        sectionId,
        title: data.title,
        type: data.type || 'VIDEO',
        description: data.description,
        duration: data.duration ? parseInt(data.duration, 10) : 0,
        contentUrl,
        order: data.order ? parseInt(data.order, 10) : lessonCount + 1,
        isFree: data.isFree === true || data.isFree === 'true',
      },
    });

    // Update course aggregates
    await prisma.course.update({
      where: { id: section.courseId },
      data: {
        totalLessons: { increment: 1 },
        totalDuration: { increment: lesson.duration || 0 },
      },
    });

    return lesson;
  }

  async updateLesson(lessonId: string, userId: string, data: any, contentFile?: Express.Multer.File) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { section: { include: { course: { include: { tutor: true } } } } },
    });

    if (!lesson || lesson.section.course.tutor.userId !== userId) {
      throw new AppError('Unauthorized.', StatusCodes.FORBIDDEN);
    }

    const contentUrl = contentFile
      ? (contentFile as any).path || (contentFile as any).secure_url
      : data.contentUrl !== undefined
      ? data.contentUrl
      : lesson.contentUrl;

    return await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.type && { type: data.type }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.duration !== undefined && { duration: parseInt(data.duration, 10) }),
        ...(contentUrl !== undefined && { contentUrl }),
        ...(data.order !== undefined && { order: parseInt(data.order, 10) }),
        ...(data.isFree !== undefined && { isFree: data.isFree === true || data.isFree === 'true' }),
      },
    });
  }

  async deleteLesson(lessonId: string, userId: string) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { section: { include: { course: { include: { tutor: true } } } } },
    });

    if (!lesson || lesson.section.course.tutor.userId !== userId) {
      throw new AppError('Unauthorized.', StatusCodes.FORBIDDEN);
    }

    await prisma.lesson.delete({ where: { id: lessonId } });

    await prisma.course.update({
      where: { id: lesson.section.courseId },
      data: {
        totalLessons: { decrement: 1 },
        totalDuration: { decrement: lesson.duration || 0 },
      },
    });

    return { message: 'Lesson deleted successfully.' };
  }

  // ── MARKETPLACE CATALOG ────────────────────────────────────

  async getCourses(query: any) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.CourseWhereInput = {
      status: CourseStatus.PUBLISHED,
    };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search as string, mode: 'insensitive' } },
        { shortDescription: { contains: query.search as string, mode: 'insensitive' } },
      ];
    }

    if (query.category) {
      where.category = query.category as string;
    }

    if (query.level) {
      where.level = query.level as string;
    }

    if (query.language) {
      where.language = query.language as string;
    }

    if (query.isFree === 'true') {
      where.price = 0;
    }

    if (query.isFeatured !== undefined) {
      where.isFeatured = query.isFeatured === 'true';
    }

    if (query.minPrice || query.maxPrice) {
      where.price = {
        ...(query.minPrice && { gte: parseFloat(query.minPrice as string) }),
        ...(query.maxPrice && { lte: parseFloat(query.maxPrice as string) }),
      };
    }

    if (query.minRating) {
      where.avgRating = { gte: parseFloat(query.minRating as string) };
    }

    let orderBy: Prisma.CourseOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sortBy === 'price') {
      orderBy = { price: query.sortOrder === 'desc' ? 'desc' : 'asc' };
    } else if (query.sortBy === 'avgRating') {
      orderBy = { avgRating: 'desc' };
    } else if (query.sortBy === 'totalEnrollments') {
      orderBy = { totalEnrollments: 'desc' };
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          tutor: {
            include: {
              user: { select: { name: true, avatar: true } },
            },
          },
        },
      }),
      prisma.course.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { courses, total, page, limit, totalPages };
  }

  async getCourseBySlug(slug: string, currentUserId?: string) {
    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        tutor: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
        sections: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
          },
        },
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!course) {
      throw new AppError('Course not found.', StatusCodes.NOT_FOUND);
    }

    let isEnrolled = false;
    if (currentUserId) {
      const enrollment = await prisma.enrollment.findUnique({
        where: { courseId_userId: { courseId: course.id, userId: currentUserId } },
      });
      isEnrolled = !!enrollment;
    }

    // Hide proprietary contentUrl if user is not enrolled and lesson is not free
    const sanitizedSections = course.sections.map((section) => ({
      ...section,
      lessons: section.lessons.map((lesson) => {
        if (isEnrolled || lesson.isFree) {
          return lesson;
        }
        const { contentUrl, ...safeLesson } = lesson;
        return safeLesson;
      }),
    }));

    return {
      ...course,
      sections: sanitizedSections,
      isEnrolled,
    };
  }

  // ── ENROLLMENT & PAYMENTS ──────────────────────────────────

  async initiateEnrollment(courseId: string, userId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { tutor: true },
    });

    if (!course || course.status !== CourseStatus.PUBLISHED) {
      throw new AppError('Course is not available for enrollment.', StatusCodes.NOT_FOUND);
    }

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { courseId_userId: { courseId, userId } },
    });

    if (existingEnrollment) {
      throw new AppError('You are already enrolled in this course.', StatusCodes.CONFLICT);
    }

    const activePrice =
      course.discountPrice && (!course.discountUntil || new Date(course.discountUntil) > new Date())
        ? course.discountPrice
        : course.price;

    // Direct enrollment for free courses
    if (activePrice === 0) {
      const enrollment = await prisma.enrollment.create({
        data: {
          courseId,
          userId,
        },
      });

      await prisma.course.update({
        where: { id: courseId },
        data: { totalEnrollments: { increment: 1 } },
      });

      await prisma.tutor.update({
        where: { id: course.tutorId },
        data: { totalSales: { increment: 1 } },
      });

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        sendEnrollmentConfirmation(user.email, user.name, course.title).catch(() => {});
      }

      return { isFree: true, enrollment };
    }

    // Create Razorpay payment order for paid courses
    const order = await createRazorpayOrder({
      amount: activePrice,
      currency: course.currency,
      receipt: `course_${courseId.substring(0, 8)}_${Date.now()}`,
      notes: { courseId, userId },
    });

    await prisma.order.create({
      data: {
        userId,
        courseId,
        amount: activePrice,
        currency: course.currency,
        razorpayOrderId: order.id,
        status: OrderStatus.PENDING,
      },
    });

    return {
      isFree: false,
      orderId: order.id,
      amount: activePrice,
      currency: course.currency,
      keyId: process.env.RAZORPAY_KEY_ID || '',
      courseTitle: course.title,
    };
  }

  async verifyPaymentAndEnroll(userId: string, data: {
    courseId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    // 1. Cryptographic Gateway Signature Verification
    const isValid = verifyRazorpaySignature(
      data.razorpayOrderId,
      data.razorpayPaymentId,
      data.razorpaySignature
    );

    if (!isValid) {
      throw new AppError('Payment signature verification failed. Invalid gateway signature.', StatusCodes.BAD_REQUEST);
    }

    // 2. Fetch local pending order
    const existingOrder = await prisma.order.findUnique({
      where: { razorpayOrderId: data.razorpayOrderId },
      include: { course: { include: { tutor: true } } },
    });

    if (!existingOrder) {
      throw new AppError('Order not found for this transaction reference.', StatusCodes.NOT_FOUND);
    }

    // 3. Verify order ownership
    if (existingOrder.userId !== userId) {
      throw new AppError('Unauthorized: Order belongs to another account.', StatusCodes.FORBIDDEN);
    }

    // 4. Verify order matches requested course
    if (existingOrder.courseId !== data.courseId) {
      throw new AppError('Course mismatch for this payment order.', StatusCodes.BAD_REQUEST);
    }

    // 5. Idempotency: If already marked as PAID, return existing enrollment
    if (existingOrder.status === OrderStatus.PAID) {
      const existingEnrollment = await prisma.enrollment.findUnique({
        where: { courseId_userId: { courseId: data.courseId, userId } },
      });
      if (existingEnrollment) {
        return { isFree: false, enrollment: existingEnrollment, alreadyProcessed: true };
      }
    }

    if (existingOrder.status !== OrderStatus.PENDING) {
      throw new AppError(`Order cannot be processed (current status: ${existingOrder.status}).`, StatusCodes.BAD_REQUEST);
    }

    // 6. Check duplicate enrollment
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { courseId_userId: { courseId: data.courseId, userId } },
    });
    if (existingEnrollment) {
      throw new AppError('You are already enrolled in this course.', StatusCodes.CONFLICT);
    }

    const course = existingOrder.course;
    const commissionPercent = course.platformCommission || 20;
    const tutorEarnings = (existingOrder.amount * (100 - commissionPercent)) / 100;

    const [order, enrollment] = await prisma.$transaction([
      prisma.order.update({
        where: { id: existingOrder.id },
        data: {
          razorpayPaymentId: data.razorpayPaymentId,
          razorpaySignature: data.razorpaySignature,
          status: OrderStatus.PAID,
        },
      }),
      prisma.enrollment.create({
        data: {
          courseId: data.courseId,
          userId,
          orderId: data.razorpayOrderId,
        },
      }),
      prisma.course.update({
        where: { id: data.courseId },
        data: { totalEnrollments: { increment: 1 } },
      }),
      prisma.tutor.update({
        where: { id: course.tutorId },
        data: {
          totalSales: { increment: 1 },
          totalEarned: { increment: tutorEarnings },
        },
      }),
    ]);

    // Send confirmation email and notification
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      sendEnrollmentConfirmation(user.email, user.name, course.title).catch(() => {});
    }

    await prisma.notification.create({
      data: {
        userId: course.tutor.userId,
        type: NotificationType.PAYMENT,
        title: 'New Student Enrollment',
        message: `${user?.name || 'A student'} enrolled in "${course.title}". Added ₹${tutorEarnings} to your earnings.`,
        link: `/dashboard/earnings`,
      },
    });

    return enrollment;
  }

  async getMyEnrollments(userId: string) {
    return await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            tutor: {
              include: { user: { select: { name: true, avatar: true } } },
            },
          },
        },
        lessonCompletions: true,
      },
      orderBy: { enrolledAt: 'desc' },
    });
  }

  async getLessonContent(lessonId: string, userId: string) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new AppError('Lesson not found.', StatusCodes.NOT_FOUND);
    }

    // Check if free or if user is enrolled
    if (!lesson.isFree) {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          courseId_userId: {
            courseId: lesson.section.courseId,
            userId,
          },
        },
      });

      if (!enrollment) {
        throw new AppError('Enrollment required to access this lesson content.', StatusCodes.FORBIDDEN);
      }
    }

    return lesson;
  }

  async completeLesson(lessonId: string, userId: string) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { section: { include: { course: true } } },
    });

    if (!lesson) throw new AppError('Lesson not found.', StatusCodes.NOT_FOUND);

    const enrollment = await prisma.enrollment.findUnique({
      where: { courseId_userId: { courseId: lesson.section.courseId, userId } },
      include: { lessonCompletions: true },
    });

    if (!enrollment) {
      throw new AppError('User not enrolled in this course.', StatusCodes.FORBIDDEN);
    }

    // Record lesson completion
    await prisma.lessonCompletion.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId,
        },
      },
      update: { completedAt: new Date() },
      create: {
        enrollmentId: enrollment.id,
        lessonId,
      },
    });

    // Calculate progress percentage
    const totalLessons = await prisma.lesson.count({
      where: { section: { courseId: lesson.section.courseId } },
    });

    const completedCount = await prisma.lessonCompletion.count({
      where: { enrollmentId: enrollment.id },
    });

    const progress = totalLessons > 0 ? parseFloat(((completedCount / totalLessons) * 100).toFixed(1)) : 100;
    const isFinished = progress >= 100;

    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        progress,
        ...(isFinished && {
          completedAt: new Date(),
          certificateIssued: true,
          certificateUrl: `/api/lms/certificates/${enrollment.id}`,
        }),
      },
    });

    return {
      progress: updatedEnrollment.progress,
      certificateIssued: updatedEnrollment.certificateIssued,
      certificateUrl: updatedEnrollment.certificateUrl,
    };
  }

  // ── REVIEWS & WISHLIST ─────────────────────────────────────

  async addCourseReview(courseId: string, userId: string, data: { rating: number; comment: string }) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { courseId_userId: { courseId, userId } },
    });

    if (!enrollment) {
      throw new AppError('Only enrolled students can review this course.', StatusCodes.FORBIDDEN);
    }

    const existingReview = await prisma.courseReview.findUnique({
      where: { courseId_userId: { courseId, userId } },
    });

    if (existingReview) {
      throw new AppError('You have already submitted a review for this course.', StatusCodes.CONFLICT);
    }

    const review = await prisma.courseReview.create({
      data: {
        courseId,
        userId,
        rating: data.rating,
        comment: data.comment,
        isApproved: false,
      },
    });

    // Notify instructor
    const course = await prisma.course.findUnique({ where: { id: courseId }, include: { tutor: true } });
    if (course) {
      await prisma.notification.create({
        data: {
          userId: course.tutor.userId,
          type: NotificationType.REVIEW,
          title: 'New Student Course Review',
          message: `A student rated "${course.title}" ${data.rating} stars.`,
          link: `/courses/${course.slug}`,
        },
      });
    }

    return review;
  }

  async getCourseReviews(courseId: string, query: any) {
    const { skip, take, page, limit } = parsePagination(query);

    const [reviews, total] = await Promise.all([
      prisma.courseReview.findMany({
        where: { courseId, isApproved: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      }),
      prisma.courseReview.count({ where: { courseId, isApproved: true } }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return { reviews, total, page, limit, totalPages };
  }

  async toggleWishlist(courseId: string, userId: string) {
    const existing = await prisma.wishlistCourse.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (existing) {
      await prisma.wishlistCourse.delete({ where: { id: existing.id } });
      return { wishlisted: false };
    } else {
      await prisma.wishlistCourse.create({ data: { userId, courseId } });
      return { wishlisted: true };
    }
  }

  async getWishlist(userId: string) {
    return await prisma.wishlistCourse.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            tutor: { include: { user: { select: { name: true, avatar: true } } } },
          },
        },
      },
    });
  }

  // ── TUTOR EARNINGS & PAYOUTS ───────────────────────────────

  async getTutorEarnings(userId: string) {
    const tutor = await prisma.tutor.findUnique({
      where: { userId },
      include: {
        courses: { select: { id: true, title: true, price: true, totalEnrollments: true } },
        payouts: true,
      },
    });

    if (!tutor) throw new AppError('Tutor not found.', StatusCodes.NOT_FOUND);

    const paidPayouts = tutor.payouts
      .filter((p) => p.status === PayoutStatus.PAID)
      .reduce((acc, p) => acc + p.amount, 0);

    const pendingPayouts = tutor.payouts
      .filter((p) => p.status === PayoutStatus.PENDING)
      .reduce((acc, p) => acc + p.amount, 0);

    const availableBalance = Math.max(0, tutor.totalEarned - paidPayouts - pendingPayouts);

    return {
      totalEarned: tutor.totalEarned,
      totalSales: tutor.totalSales,
      paidAmount: paidPayouts,
      pendingPayout: pendingPayouts,
      availableBalance,
      courses: tutor.courses,
    };
  }

  async requestPayout(userId: string, data: { amount: number; notes?: string }) {
    if (!data.amount || !Number.isFinite(data.amount) || data.amount < 500) {
      throw new AppError('Minimum payout withdrawal amount is ₹500.', StatusCodes.BAD_REQUEST);
    }

    if (data.amount > 10000000) {
      throw new AppError('Payout request exceeds single withdrawal limit.', StatusCodes.BAD_REQUEST);
    }

    const tutor = await prisma.tutor.findUnique({
      where: { userId },
    });

    if (!tutor) throw new AppError('Tutor not found.', StatusCodes.NOT_FOUND);

    // Atomic transaction prevents concurrent race-condition withdrawals
    const payout = await prisma.$transaction(async (tx) => {
      // 1. Ensure no other pending payout is active for this tutor
      const pendingExisting = await tx.payout.findFirst({
        where: { tutorId: tutor.id, status: PayoutStatus.PENDING },
      });

      if (pendingExisting) {
        throw new AppError(
          'You already have a payout request pending review. Please wait for it to be processed.',
          StatusCodes.CONFLICT
        );
      }

      // 2. Fetch all historical payouts inside transaction
      const tutorPayouts = await tx.payout.findMany({
        where: { tutorId: tutor.id },
      });

      const paidPayouts = tutorPayouts
        .filter((p) => p.status === PayoutStatus.PAID)
        .reduce((acc, p) => acc + p.amount, 0);

      const pendingPayouts = tutorPayouts
        .filter((p) => p.status === PayoutStatus.PENDING)
        .reduce((acc, p) => acc + p.amount, 0);

      const availableBalance = tutor.totalEarned - paidPayouts - pendingPayouts;

      if (data.amount > availableBalance) {
        throw new AppError(
          `Requested amount (₹${data.amount}) exceeds available balance (₹${availableBalance}).`,
          StatusCodes.BAD_REQUEST
        );
      }

      return await tx.payout.create({
        data: {
          tutorId: tutor.id,
          amount: data.amount,
          status: PayoutStatus.PENDING,
          notes: data.notes,
        },
      });
    });

    // Notify admins
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          type: NotificationType.PAYMENT,
          title: 'New Payout Request',
          message: `Payout request for ₹${data.amount} submitted by instructor.`,
          link: `/admin/payouts`,
        })),
      });
    }

    return payout;
  }

  async getMyPayouts(userId: string) {
    const tutor = await prisma.tutor.findUnique({ where: { userId } });
    if (!tutor) throw new AppError('Tutor not found.', StatusCodes.NOT_FOUND);

    return await prisma.payout.findMany({
      where: { tutorId: tutor.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async uploadDocuments(userId: string, files: Express.Multer.File[]) {
    const tutor = await prisma.tutor.findUnique({ where: { userId } });
    if (!tutor) throw new AppError('Tutor not found.', StatusCodes.NOT_FOUND);

    return await prisma.tutorDocument.createMany({
      data: files.map((f) => ({
        tutorId: tutor.id,
        fileUrl: (f as any).path || (f as any).secure_url || f.filename,
        fileName: f.originalname,
        docType: 'TEACHING_CREDENTIAL',
      })),
    });
  }
}

export const lmsService = new LMSService();
