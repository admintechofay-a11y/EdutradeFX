import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthenticatedRequest } from '../../types';
import { providerCompanyService } from './provider.company.service';
import { providerCategoryService } from './provider.category.service';
import { providerProductService } from './provider.product.service';
import { providerTeamService } from './provider.team.service';
import { providerDocsService } from './provider.docs.service';
import { sendSuccess } from '../../utils/response.utils';
import { AppError } from '../../middleware/error.middleware';

export class ProviderController {
  // ── COMPANY PROFILE ─────────────────────────────────────────────────────
  getMyProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const profile = await providerCompanyService.getMyProfile(req.user!.userId);
    sendSuccess(res, profile, 'Profile retrieved successfully');
  };

  updateMyProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const profile = await providerCompanyService.updateMyProfile(req.user!.userId, req.body);
    sendSuccess(res, profile, 'Profile updated successfully');
  };

  uploadLogo = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.file) throw new AppError('No logo file provided', StatusCodes.BAD_REQUEST);
    const result = await providerCompanyService.uploadLogo(req.user!.userId, req.file);
    sendSuccess(res, result, 'Logo uploaded successfully');
  };

  uploadCover = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.file) throw new AppError('No cover image file provided', StatusCodes.BAD_REQUEST);
    const result = await providerCompanyService.uploadCover(req.user!.userId, req.file);
    sendSuccess(res, result, 'Cover image uploaded successfully');
  };

  uploadPresentation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.file) throw new AppError('No presentation file provided', StatusCodes.BAD_REQUEST);
    const result = await providerCompanyService.uploadPresentation(req.user!.userId, req.file);
    sendSuccess(res, result, 'Company presentation uploaded successfully');
  };

  // ── CATEGORIES ──────────────────────────────────────────────────────────
  getMyCategories = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const selections = await providerCategoryService.getMyCategories(req.user!.userId);
    sendSuccess(res, selections, 'Selected categories retrieved successfully');
  };

  selectCategories = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const selections = await providerCategoryService.selectCategories(req.user!.userId, req.body);
    sendSuccess(res, selections, 'Categories updated successfully');
  };

  getCategoryForm = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const catNum = parseInt(String(req.params.number), 10);
    const form = await providerCategoryService.getCategoryForm(req.user!.userId, catNum);
    sendSuccess(res, form, `Category #${catNum} form data retrieved`);
  };

  saveCategoryDraft = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const catNum = parseInt(String(req.params.number), 10);
    const result = await providerCategoryService.saveCategoryDraft(
      req.user!.userId,
      catNum,
      req.body.answers,
      req.body.subcategoryId
    );
    sendSuccess(res, result, `Category #${catNum} draft saved successfully`);
  };

  submitCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const catNum = parseInt(String(req.params.number), 10);
    const result = await providerCategoryService.submitCategory(
      req.user!.userId,
      catNum,
      req.body.answers,
      req.body.subcategoryId
    );
    sendSuccess(res, result, `Category #${catNum} submitted successfully for review`);
  };

  // ── PRODUCTS MASTER ─────────────────────────────────────────────────────
  getMyProducts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const products = await providerProductService.getMyProducts(req.user!.userId);
    sendSuccess(res, products, 'Products retrieved successfully');
  };

  getProductById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const product = await providerProductService.getProductById(req.user!.userId, String(req.params.id));
    sendSuccess(res, product, 'Product details retrieved successfully');
  };

  createProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const product = await providerProductService.createProduct(req.user!.userId, req.body);
    sendSuccess(res, product, 'Product created successfully', StatusCodes.CREATED);
  };

  updateProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const product = await providerProductService.updateProduct(req.user!.userId, String(req.params.id), req.body);
    sendSuccess(res, product, 'Product updated successfully');
  };

  deleteProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const product = await providerProductService.deleteProduct(req.user!.userId, String(req.params.id));
    sendSuccess(res, product, 'Product archived successfully');
  };

  duplicateProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const product = await providerProductService.duplicateProduct(req.user!.userId, String(req.params.id));
    sendSuccess(res, product, 'Product duplicated successfully', StatusCodes.CREATED);
  };

  linkProductCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const link = await providerProductService.linkCategory(req.user!.userId, String(req.params.id), req.body);
    sendSuccess(res, link, 'Product category updated successfully');
  };

  updateTechnicalSpec = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const spec = await providerProductService.updateTechnicalSpec(req.user!.userId, String(req.params.id), req.body);
    sendSuccess(res, spec, 'Technical specifications updated successfully');
  };

  updateIntegration = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const int = await providerProductService.updateIntegration(req.user!.userId, String(req.params.id), req.body);
    sendSuccess(res, int, 'Integrations updated successfully');
  };

  updatePricing = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const pr = await providerProductService.updatePricing(req.user!.userId, String(req.params.id), req.body);
    sendSuccess(res, pr, 'Pricing updated successfully');
  };

  addProductMedia = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const media = await providerProductService.addMedia(req.user!.userId, String(req.params.id), req.body);
    sendSuccess(res, media, 'Product media added successfully', StatusCodes.CREATED);
  };

  deleteProductMedia = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const media = await providerProductService.deleteMedia(req.user!.userId, String(req.params.id), String(req.params.mediaId));
    sendSuccess(res, media, 'Product media deleted successfully');
  };

  addProductDoc = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const doc = await providerProductService.addDocument(req.user!.userId, String(req.params.id), req.body);
    sendSuccess(res, doc, 'Product document added successfully', StatusCodes.CREATED);
  };

  deleteProductDoc = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const doc = await providerProductService.deleteDocument(req.user!.userId, String(req.params.id), String(req.params.docId));
    sendSuccess(res, doc, 'Product document deleted successfully');
  };

  // ── TEAM MEMBERS ────────────────────────────────────────────────────────
  getTeamMembers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const members = await providerTeamService.getTeamMembers(req.user!.userId);
    sendSuccess(res, members, 'Team members retrieved successfully');
  };

  createTeamMember = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const member = await providerTeamService.createTeamMember(req.user!.userId, req.body);
    sendSuccess(res, member, 'Team member added successfully', StatusCodes.CREATED);
  };

  updateTeamMember = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const member = await providerTeamService.updateTeamMember(req.user!.userId, String(req.params.id), req.body);
    sendSuccess(res, member, 'Team member updated successfully');
  };

  deleteTeamMember = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const member = await providerTeamService.deleteTeamMember(req.user!.userId, String(req.params.id));
    sendSuccess(res, member, 'Team member removed successfully');
  };

  uploadTeamPhoto = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.file) throw new AppError('No photo file provided', StatusCodes.BAD_REQUEST);
    const result = await providerTeamService.uploadPhoto(req.user!.userId, String(req.params.id), req.file);
    sendSuccess(res, result, 'Photo uploaded successfully');
  };

  // ── VERIFICATION DOCUMENTS ──────────────────────────────────────────────
  getDocuments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const docs = await providerDocsService.getDocuments(req.user!.userId);
    sendSuccess(res, docs, 'Documents retrieved successfully');
  };

  createDocument = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const doc = await providerDocsService.createDocument(req.user!.userId, req.body);
    sendSuccess(res, doc, 'Document record created successfully', StatusCodes.CREATED);
  };

  updateDocument = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const doc = await providerDocsService.updateDocument(req.user!.userId, String(req.params.id), req.body);
    sendSuccess(res, doc, 'Document updated successfully');
  };

  deleteDocument = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const doc = await providerDocsService.deleteDocument(req.user!.userId, String(req.params.id));
    sendSuccess(res, doc, 'Document deleted successfully');
  };

  uploadDocumentFile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.file) throw new AppError('No document file provided', StatusCodes.BAD_REQUEST);
    const doc = await providerDocsService.uploadDocumentFile(req.user!.userId, req.file, req.body);
    sendSuccess(res, doc, 'Document uploaded to secure vault successfully', StatusCodes.CREATED);
  };

  getSignedDocumentUrl = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await providerDocsService.getSignedUrl(req.user!.userId, String(req.params.id));
    sendSuccess(res, result, 'Temporary signed download URL generated');
  };

  // ── OVERVIEW / SUMMARY ──────────────────────────────────────────────────
  getMySummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const summary = await providerCompanyService.getMySummary(req.user!.userId);
    sendSuccess(res, summary, 'Solutions Provider summary retrieved successfully');
  };

  // ── INBOUND B2B ENQUIRIES ───────────────────────────────────────────────
  getEnquiries = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const enquiries = await providerCompanyService.getEnquiries(req.user!.userId);
    sendSuccess(res, enquiries, 'Inbound enquiries retrieved successfully');
  };

  updateEnquiryStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const enquiry = await providerCompanyService.updateEnquiryStatus(
      req.user!.userId,
      String(req.params.id),
      req.body.status
    );
    sendSuccess(res, enquiry, 'Enquiry status updated successfully');
  };

  // ── REVIEWS & RATINGS ───────────────────────────────────────────────────
  getReviews = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const reviews = await providerCompanyService.getReviews(req.user!.userId);
    sendSuccess(res, reviews, 'Reviews retrieved successfully');
  };

  // ── LEGAL AGREEMENTS & FORM 8 SUBMISSION ────────────────────────────────
  getAgreements = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    const agreements = await providerCompanyService.getAgreements();
    sendSuccess(res, agreements, 'Active agreements retrieved successfully');
  };

  submitProvider = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await providerCompanyService.submitProvider(
      req.user!.userId,
      req.body.declarations,
      {
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      }
    );
    sendSuccess(res, result, 'Solutions Provider application submitted for review', StatusCodes.OK);
  };
}

export const providerController = new ProviderController();
