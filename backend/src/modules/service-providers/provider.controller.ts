import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthenticatedRequest } from '../../types';
import { providerCompanyService } from './provider.company.service';
import { providerCategoryService } from './provider.category.service';
import { sendSuccess } from '../../utils/response.utils';
import { AppError } from '../../middleware/error.middleware';

export class ProviderController {
  // ── COMPANY PROFILE ─────────────────────────────────────────────────────
  getMyProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const profile = await providerCompanyService.getMyProfile(userId);
    sendSuccess(res, profile, 'Profile retrieved successfully');
  };

  updateMyProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const profile = await providerCompanyService.updateMyProfile(userId, req.body);
    sendSuccess(res, profile, 'Profile updated successfully');
  };

  uploadLogo = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    if (!req.file) {
      throw new AppError('No logo file provided', StatusCodes.BAD_REQUEST);
    }
    const result = await providerCompanyService.uploadLogo(userId, req.file);
    sendSuccess(res, result, 'Logo uploaded successfully');
  };

  uploadCover = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    if (!req.file) {
      throw new AppError('No cover image file provided', StatusCodes.BAD_REQUEST);
    }
    const result = await providerCompanyService.uploadCover(userId, req.file);
    sendSuccess(res, result, 'Cover image uploaded successfully');
  };

  uploadPresentation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    if (!req.file) {
      throw new AppError('No presentation file provided', StatusCodes.BAD_REQUEST);
    }
    const result = await providerCompanyService.uploadPresentation(userId, req.file);
    sendSuccess(res, result, 'Company presentation uploaded successfully');
  };

  // ── CATEGORIES ──────────────────────────────────────────────────────────
  getMyCategories = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const selections = await providerCategoryService.getMyCategories(userId);
    sendSuccess(res, selections, 'Selected categories retrieved successfully');
  };

  selectCategories = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const selections = await providerCategoryService.selectCategories(userId, req.body);
    sendSuccess(res, selections, 'Categories updated successfully');
  };

  getCategoryForm = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const categoryNumber = parseInt(String(req.params.number), 10);
    const form = await providerCategoryService.getCategoryForm(userId, categoryNumber);
    sendSuccess(res, form, `Category #${categoryNumber} form data retrieved`);
  };

  saveCategoryDraft = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const categoryNumber = parseInt(String(req.params.number), 10);
    const result = await providerCategoryService.saveCategoryDraft(
      userId,
      categoryNumber,
      req.body.answers,
      req.body.subcategoryId
    );
    sendSuccess(res, result, `Category #${categoryNumber} draft saved successfully`);
  };

  submitCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const categoryNumber = parseInt(String(req.params.number), 10);
    const result = await providerCategoryService.submitCategory(
      userId,
      categoryNumber,
      req.body.answers,
      req.body.subcategoryId
    );
    sendSuccess(res, result, `Category #${categoryNumber} submitted successfully for review`);
  };
}

export const providerController = new ProviderController();
