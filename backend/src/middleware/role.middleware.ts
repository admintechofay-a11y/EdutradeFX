import { Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Role } from '@prisma/client';
import { AppError } from './error.middleware';
import { AuthenticatedRequest } from '../types';

export const authorize = (...roles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Authentication required.', StatusCodes.UNAUTHORIZED);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(
        `Access forbidden: Requires one of [${roles.join(', ')}] privileges. Current role: ${req.user.role}`,
        StatusCodes.FORBIDDEN
      );
    }

    next();
  };
};
