import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import multer from 'multer';
import { logger } from '../utils/logger';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errors?: any;

  constructor(message: string, statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  let statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || undefined;
  let code: string | undefined = undefined;

  // Prisma Error Handling
  if (err.code) {
    code = err.code;
    switch (err.code) {
      case 'P2002': {
        statusCode = StatusCodes.CONFLICT;
        const target = err.meta?.target ? ` (${(err.meta.target as string[]).join(', ')})` : '';
        message = `Unique constraint failed on field${target}. A record with this value already exists.`;
        break;
      }
      case 'P2025': {
        statusCode = StatusCodes.NOT_FOUND;
        message = (err.meta?.cause as string) || 'Record not found in the database.';
        break;
      }
      case 'P2003': {
        statusCode = StatusCodes.BAD_REQUEST;
        message = 'Foreign key constraint violated on relation.';
        break;
      }
      default:
        if (err.code.startsWith('P')) {
          statusCode = StatusCodes.BAD_REQUEST;
          message = `Database operation error: ${err.message}`;
        }
    }
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Invalid authentication token. Please sign in again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Authentication token has expired. Please refresh your session.';
  }

  // Multer Upload Errors
  if (err instanceof multer.MulterError) {
    statusCode = StatusCodes.BAD_REQUEST;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'Uploaded file exceeds the maximum allowed size limit.';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = `Unexpected upload field: ${err.field}`;
    } else {
      message = `File upload error: ${err.message}`;
    }
  }

  // Validation Error Formatting (e.g., from Zod or express-validator)
  if (err.name === 'ZodError') {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Validation failed';
    errors = err.issues?.map((issue: any) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
  }

  // Log Error details
  if (statusCode >= 500) {
    logger.error(`[${req.method} ${req.originalUrl}] - 500 Error: ${err.message} \nStack: ${err.stack}`);
  } else {
    logger.warn(`[${req.method} ${req.originalUrl}] - ${statusCode}: ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(code && { code }),
    ...(process.env.NODE_ENV === 'development' && statusCode >= 500 ? { stack: err.stack } : {}),
  });
};
