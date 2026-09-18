import { Request } from 'express';
import { Role } from '@prisma/client';

export interface TokenPayload {
  userId: string;
  role: Role;
}

export interface RefreshTokenPayload {
  userId: string;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
