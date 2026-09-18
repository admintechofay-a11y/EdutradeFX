import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { complaintService } from './complaint.service';
import { sendSuccess, sendPaginated } from '../../utils/response.utils';
import { AuthenticatedRequest } from '../../types';

export class ComplaintController {
  submitComplaint = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const files = req.files as Express.Multer.File[] | undefined;
    const complaint = await complaintService.submitComplaint(req.user!.userId, req.body, files);
    sendSuccess(res, complaint, 'Complaint submitted successfully', StatusCodes.CREATED);
  };

  getMyComplaints = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await complaintService.getMyComplaints(req.user!.userId, req.query);
    sendPaginated(res, result.complaints, result.total, result.page, result.limit, 'Your complaints retrieved');
  };

  getComplaintById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const complaint = await complaintService.getComplaintById(id as string, req.user!.userId, req.user!.role);
    sendSuccess(res, complaint, 'Complaint details retrieved', StatusCodes.OK);
  };

  getAllComplaintsAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const result = await complaintService.getAllComplaintsAdmin(req.query);
    sendPaginated(res, result.complaints, result.total, result.page, result.limit, 'All complaints retrieved');
  };

  updateComplaint = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const updated = await complaintService.updateComplaint(id as string, req.user!.userId, req.body);
    sendSuccess(res, updated, 'Complaint record updated', StatusCodes.OK);
  };
}

export const complaintController = new ComplaintController();
