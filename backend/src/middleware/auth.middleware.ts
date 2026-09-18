import { Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { verifyAccessToken } from '../utils/jwt.utils';
import { AppError } from './error.middleware';
import { AuthenticatedRequest } from '../types';

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authentication required. Missing or malformed token.', StatusCodes.UNAUTHORIZED);
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new AppError('Authentication token missing.', StatusCodes.UNAUTHORIZED);
  }

  const decoded = verifyAccessToken(token);
  req.user = decoded;
  next();
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token) {
      try {
        const decoded = verifyAccessToken(token);
        req.user = decoded;
      } catch {
        // Soft fail on optional auth; proceed as unauthenticated guest
        req.user = undefined;
      }
    }
  }

  next();
};
