import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { lmsService } from './lms.service';
import { sendSuccess, sendPaginated } from '../../utils/response.utils';
import { AuthenticatedRequest } from '../../types';

export class LMSController {
  // Tutor actions
  registerTutor = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const photoFile = files?.['photo']?.[0];
    const docFiles = files?.['docs'];

    const tutor = await lmsService.registerTutor(req.user!.userId, req.body, photoFile, docFiles);
    sendSuccess(res, tutor, 'Tutor application submitted for review', StatusCodes.CREATED);
  };

  getMyTutorProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const profile = await lmsService.getMyTutorProfile(req.user!.userId);
    sendSuccess(res, profile, 'Tutor profile retrieved', StatusCodes.OK);
  };

  createCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const thumbFile = files?.['thumbnail']?.[0];
    const promoFile = files?.['promoVideo']?.[0];

    const course = await lmsService.createCourse(req.user!.userId, req.body, thumbFile, promoFile);
    sendSuccess(res, course, 'Course created as draft', StatusCodes.CREATED);
  };

  updateCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const thumbFile = files?.['thumbnail']?.[0];
    const promoFile = files?.['promoVideo']?.[0];

    const course = await lmsService.updateCourse(id as string, req.user!.userId, req.body, thumbFile, promoFile);
    sendSuccess(res, course, 'Course updated successfully', StatusCodes.OK);
  };

  deleteCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await lmsService.deleteCourse(id as string, req.user!.userId);
    sendSuccess(res, null, result.message, StatusCodes.OK);
  };

  submitCourseForReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const course = await lmsService.submitCourseForReview(id as string, req.user!.userId);
    sendSuccess(res, course, 'Course submitted for admin review and publishing', StatusCodes.OK);
  };

  // Sections & Lessons
  createSection = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params; // courseId
    const section = await lmsService.createSection(id as string, req.user!.userId, req.body);
    sendSuccess(res, section, 'Section created', StatusCodes.CREATED);
  };

  updateSection = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params; // sectionId
    const section = await lmsService.updateSection(id as string, req.user!.userId, req.body);
    sendSuccess(res, section, 'Section updated', StatusCodes.OK);
  };

  deleteSection = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params; // sectionId
    const result = await lmsService.deleteSection(id as string, req.user!.userId);
    sendSuccess(res, null, result.message, StatusCodes.OK);
  };

  createLesson = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params; // sectionId
    const lesson = await lmsService.createLesson(id as string, req.user!.userId, req.body, req.file);
    sendSuccess(res, lesson, 'Lesson added to curriculum', StatusCodes.CREATED);
  };

  updateLesson = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params; // lessonId
    const lesson = await lmsService.updateLesson(id as string, req.user!.userId, req.body, req.file);
    sendSuccess(res, lesson, 'Lesson updated', StatusCodes.OK);
  };

  deleteLesson = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params; // lessonId
    const result = await lmsService.deleteLesson(id as string, req.user!.userId);
    sendSuccess(res, null, result.message, StatusCodes.OK);
  };

  // Public Marketplace
  getCourses = async (req: Request, res: Response): Promise<void> => {
    const result = await lmsService.getCourses(req.query);
    sendPaginated(res, result.courses, result.total, result.page, result.limit, 'Courses retrieved');
  };

  getCourseBySlug = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { slug } = req.params;
    const course = await lmsService.getCourseBySlug(slug as string, req.user?.userId);
    sendSuccess(res, course, 'Course details retrieved', StatusCodes.OK);
  };

  // Learning & Enrollment
  initiateEnrollment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await lmsService.initiateEnrollment(id as string, req.user!.userId);
    sendSuccess(res, result, result.isFree ? 'Enrolled successfully in free course' : 'Payment order initialized', StatusCodes.OK);
  };

  verifyPaymentAndEnroll = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const enrollment = await lmsService.verifyPaymentAndEnroll(req.user!.userId, req.body);
    sendSuccess(res, enrollment, 'Payment verified and enrollment confirmed!', StatusCodes.OK);
  };

  getMyEnrollments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const enrollments = await lmsService.getMyEnrollments(req.user!.userId);
    sendSuccess(res, enrollments, 'Enrollments retrieved', StatusCodes.OK);
  };

  getLessonContent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { lessonId } = req.params;
    const lesson = await lmsService.getLessonContent(lessonId as string, req.user!.userId);
    sendSuccess(res, lesson, 'Lesson content retrieved', StatusCodes.OK);
  };

  completeLesson = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { lessonId } = req.params;
    const result = await lmsService.completeLesson(lessonId as string, req.user!.userId);
    sendSuccess(res, result, 'Lesson marked as completed', StatusCodes.OK);
  };

  // Reviews & Wishlist
  addCourseReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const review = await lmsService.addCourseReview(id as string, req.user!.userId, req.body);
    sendSuccess(res, review, 'Review submitted. Pending moderation.', StatusCodes.CREATED);
  };

  getCourseReviews = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await lmsService.getCourseReviews(id as string, req.query);
    sendPaginated(res, result.reviews, result.total, result.page, result.limit, 'Course reviews retrieved');
  };

  toggleWishlist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await lmsService.toggleWishlist(id as string, req.user!.userId);
    sendSuccess(res, result, result.wishlisted ? 'Added to wishlist' : 'Removed from wishlist', StatusCodes.OK);
  };

  getWishlist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const wishlist = await lmsService.getWishlist(req.user!.userId);
    sendSuccess(res, wishlist, 'Wishlist retrieved', StatusCodes.OK);
  };

  // Tutor Financials
  getTutorEarnings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const earnings = await lmsService.getTutorEarnings(req.user!.userId);
    sendSuccess(res, earnings, 'Tutor earnings retrieved', StatusCodes.OK);
  };

  requestPayout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const payout = await lmsService.requestPayout(req.user!.userId, req.body);
    sendSuccess(res, payout, 'Payout request submitted to finance', StatusCodes.CREATED);
  };

  getMyPayouts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const payouts = await lmsService.getMyPayouts(req.user!.userId);
    sendSuccess(res, payouts, 'Payout history retrieved', StatusCodes.OK);
  };

  uploadDocuments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const files = req.files as Express.Multer.File[];
    await lmsService.uploadDocuments(req.user!.userId, files);
    sendSuccess(res, null, 'Documents uploaded successfully', StatusCodes.OK);
  };
}

export const lmsController = new LMSController();
