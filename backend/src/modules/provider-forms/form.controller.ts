import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { formService } from './form.service';
import { formAdminService } from './form.admin.service';
import { sendSuccess } from '../../utils/response.utils';

export class FormController {
  // ── PUBLIC / PARTNER QUERIES ────────────────────────────────────────────
  getCategories = async (req: Request, res: Response): Promise<void> => {
    const data = await formService.getCategories();
    sendSuccess(res, data, 'Categories retrieved successfully');
  };

  getOptionLists = async (req: Request, res: Response): Promise<void> => {
    const data = await formService.getOptionLists();
    sendSuccess(res, data, 'Option lists retrieved successfully');
  };

  getCategoryByNumber = async (req: Request, res: Response): Promise<void> => {
    const categoryNumber = parseInt(String(req.params.number), 10);
    const data = await formService.getCategoryByNumber(categoryNumber);
    sendSuccess(res, data, `Category #${categoryNumber} retrieved successfully`);
  };

  // ── ADMIN CRUD ──────────────────────────────────────────────────────────
  createCategory = async (req: Request, res: Response): Promise<void> => {
    const cat = await formAdminService.createCategory(req.body);
    sendSuccess(res, cat, 'Category created successfully', StatusCodes.CREATED);
  };

  updateCategory = async (req: Request, res: Response): Promise<void> => {
    const cat = await formAdminService.updateCategory(String(req.params.id), req.body);
    sendSuccess(res, cat, 'Category updated successfully');
  };

  deleteCategory = async (req: Request, res: Response): Promise<void> => {
    const cat = await formAdminService.deleteCategory(String(req.params.id));
    sendSuccess(res, cat, 'Category deactivated successfully');
  };

  createSubcategory = async (req: Request, res: Response): Promise<void> => {
    const sub = await formAdminService.createSubcategory(req.body);
    sendSuccess(res, sub, 'Subcategory created successfully', StatusCodes.CREATED);
  };

  updateSubcategory = async (req: Request, res: Response): Promise<void> => {
    const sub = await formAdminService.updateSubcategory(String(req.params.id), req.body);
    sendSuccess(res, sub, 'Subcategory updated successfully');
  };

  deleteSubcategory = async (req: Request, res: Response): Promise<void> => {
    const sub = await formAdminService.deleteSubcategory(String(req.params.id));
    sendSuccess(res, sub, 'Subcategory deactivated successfully');
  };

  createSection = async (req: Request, res: Response): Promise<void> => {
    const sec = await formAdminService.createSection(req.body);
    sendSuccess(res, sec, 'Section created successfully', StatusCodes.CREATED);
  };

  updateSection = async (req: Request, res: Response): Promise<void> => {
    const sec = await formAdminService.updateSection(String(req.params.id), req.body);
    sendSuccess(res, sec, 'Section updated successfully');
  };

  deleteSection = async (req: Request, res: Response): Promise<void> => {
    const sec = await formAdminService.deleteSection(String(req.params.id));
    sendSuccess(res, sec, 'Section deactivated successfully');
  };

  createField = async (req: Request, res: Response): Promise<void> => {
    const fld = await formAdminService.createField(req.body);
    sendSuccess(res, fld, 'Field created successfully', StatusCodes.CREATED);
  };

  updateField = async (req: Request, res: Response): Promise<void> => {
    const fld = await formAdminService.updateField(String(req.params.id), req.body);
    sendSuccess(res, fld, 'Field updated successfully');
  };

  deleteField = async (req: Request, res: Response): Promise<void> => {
    const fld = await formAdminService.deleteField(String(req.params.id));
    sendSuccess(res, fld, 'Field deactivated successfully');
  };

  createOptionList = async (req: Request, res: Response): Promise<void> => {
    const list = await formAdminService.createOptionList(req.body);
    sendSuccess(res, list, 'Option list created successfully', StatusCodes.CREATED);
  };

  updateOptionList = async (req: Request, res: Response): Promise<void> => {
    const list = await formAdminService.updateOptionList(String(req.params.id), req.body);
    sendSuccess(res, list, 'Option list updated successfully');
  };

  deleteOptionList = async (req: Request, res: Response): Promise<void> => {
    const list = await formAdminService.deleteOptionList(String(req.params.id));
    sendSuccess(res, list, 'Option list deleted successfully');
  };

  reorderSections = async (req: Request, res: Response): Promise<void> => {
    const result = await formAdminService.reorderSections(req.body.items);
    sendSuccess(res, result, 'Sections reordered successfully');
  };

  reorderFields = async (req: Request, res: Response): Promise<void> => {
    const result = await formAdminService.reorderFields(req.body.items);
    sendSuccess(res, result, 'Fields reordered successfully');
  };
}

export const formController = new FormController();
