import { Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthenticatedRequest } from '../types';
import { AppError } from './error.middleware';
import { prisma } from '../config/database';

export const blockDemoAccountMutation = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  if (req.user?.isDemoAccount) {
    throw new AppError(
      'This action is restricted for demo accounts.',
      StatusCodes.FORBIDDEN,
      'DEMO_ACCOUNT_RESTRICTED'
    );
  }
  next();
};

export const guardDemoAdminAction = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user?.isDemoAccount) {
    return next();
  }

  // Demo admin has restrictions on non-demo assets
  const path = req.path.toLowerCase();
  const method = req.method.toUpperCase();

  // Block system reconfiguration or destructive endpoints
  if (path.startsWith('/system/') && method !== 'GET') {
    throw new AppError(
      'System modification is restricted for demo accounts.',
      StatusCodes.FORBIDDEN,
      'DEMO_ACCOUNT_RESTRICTED'
    );
  }

  // Block mutating non-demo users
  if (path.startsWith('/users/') && (method === 'DELETE' || method === 'PATCH' || method === 'PUT')) {
    const rawTargetId = req.params.id;
    const targetUserId = Array.isArray(rawTargetId) ? rawTargetId[0] : rawTargetId;
    if (targetUserId) {
      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { isDemoAccount: true },
      });
      if (targetUser && !targetUser.isDemoAccount) {
        throw new AppError(
          'Mutating non-demo accounts is restricted for demo admins.',
          StatusCodes.FORBIDDEN,
          'DEMO_ACCOUNT_RESTRICTED'
        );
      }
    }
  }

  // Block signed URL document access for non-demo providers
  if (path.includes('/documents/') && path.endsWith('/url')) {
    const rawProviderId = req.params.providerId || req.params.id;
    const providerId = Array.isArray(rawProviderId) ? rawProviderId[0] : rawProviderId;
    if (providerId) {
      const targetUser = await prisma.user.findFirst({
        where: { serviceProvider: { id: providerId } },
        select: { isDemoAccount: true },
      });
      if (targetUser && !targetUser.isDemoAccount) {
        throw new AppError(
          'Accessing documents of non-demo providers is restricted for demo accounts.',
          StatusCodes.FORBIDDEN,
          'DEMO_ACCOUNT_RESTRICTED'
        );
      }
    }
  }

  next();
};
