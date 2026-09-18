import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ApiResponse } from '../types';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = 'Operation successful',
  statusCode: number = StatusCodes.OK
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string = 'Operation failed',
  statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
  errors?: any
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    ...(errors && { errors }),
  };
  return res.status(statusCode).json(response);
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message: string = 'Data retrieved successfully'
): Response => {
  const totalPages = Math.ceil(total / limit) || 1;
  const response: ApiResponse<T[]> = {
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
  return res.status(StatusCodes.OK).json(response);
};
