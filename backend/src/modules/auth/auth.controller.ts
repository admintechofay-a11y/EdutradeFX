import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { authService } from './auth.service';
import { sendSuccess } from '../../utils/response.utils';
import { AuthenticatedRequest } from '../../types';

export class AuthController {
  register = async (req: Request, res: Response): Promise<void> => {
    const result = await authService.register(req.body);
    sendSuccess(res, result.user, result.message, StatusCodes.CREATED);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    // Set refresh token in secure HTTP-only cookie as well for web security
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, result, 'Login successful', StatusCodes.OK);
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    const token = req.body.refreshToken || req.cookies?.refreshToken;
    const result = await authService.refreshToken(token);
    sendSuccess(res, result, 'Access token refreshed', StatusCodes.OK);
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const token = req.body.refreshToken || req.cookies?.refreshToken;
    if (token) {
      await authService.logout(token);
    }
    res.clearCookie('refreshToken');
    sendSuccess(res, null, 'Logged out successfully', StatusCodes.OK);
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const result = await authService.forgotPassword(req.body.email);
    sendSuccess(res, null, result.message, StatusCodes.OK);
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    const { token, password } = req.body;
    const result = await authService.resetPassword(token, password);
    sendSuccess(res, null, result.message, StatusCodes.OK);
  };

  verifyEmail = async (req: Request, res: Response): Promise<void> => {
    const { token } = req.params;
    const result = await authService.verifyEmail(token as string);
    sendSuccess(res, null, result.message, StatusCodes.OK);
  };

  getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const user = await authService.getMe(req.user!.userId);
    sendSuccess(res, user, 'Profile retrieved', StatusCodes.OK);
  };

  changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user!.userId, currentPassword, newPassword);
    sendSuccess(res, null, result.message, StatusCodes.OK);
  };
}

export const authController = new AuthController();
