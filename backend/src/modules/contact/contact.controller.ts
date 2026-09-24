import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { contactService } from './contact.service';
import { sendSuccess, sendPaginated } from '../../utils/response.utils';

export class ContactController {
  submitEnquiry = async (req: Request, res: Response): Promise<void> => {
    const enquiry = await contactService.createEnquiry(req.body);
    sendSuccess(
      res,
      enquiry,
      'Thank you for contacting EdutradeFX. Your inquiry has been received and our compliance team will respond within 1 business day.',
      StatusCodes.CREATED
    );
  };

  getAllEnquiriesAdmin = async (req: Request, res: Response): Promise<void> => {
    const result = await contactService.getAllEnquiries(req.query);
    sendPaginated(res, result.enquiries, result.total, result.page, result.limit, 'Contact enquiries retrieved');
  };

  getEnquiryByIdAdmin = async (req: Request, res: Response): Promise<void> => {
    const enquiry = await contactService.getEnquiryById(req.params.id as string);
    sendSuccess(res, enquiry, 'Enquiry details retrieved', StatusCodes.OK);
  };

  updateEnquiryAdmin = async (req: Request, res: Response): Promise<void> => {
    const updated = await contactService.updateEnquiry(req.params.id as string, req.body);
    sendSuccess(res, updated, 'Enquiry updated successfully', StatusCodes.OK);
  };

  deleteEnquiryAdmin = async (req: Request, res: Response): Promise<void> => {
    const result = await contactService.deleteEnquiry(req.params.id as string);
    sendSuccess(res, null, result.message, StatusCodes.OK);
  };
}

export const contactController = new ContactController();
