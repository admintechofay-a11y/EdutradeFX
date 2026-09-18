import jwt, { SignOptions } from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../middleware/error.middleware';
import { TokenPayload, RefreshTokenPayload } from '../types';

const ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || 'edutrade_super_secret_access_key_minimum_64_characters_long_forex_platform_2025';
const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'edutrade_super_secret_refresh_key_minimum_64_characters_long_forex_platform_2025';
const ACCESS_EXPIRY = (process.env.JWT_ACCESS_EXPIRY || '15m') as any;
const REFRESH_EXPIRY = (process.env.JWT_REFRESH_EXPIRY || '7d') as any;

export const generateAccessToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: ACCESS_EXPIRY,
  };
  return jwt.sign(payload, ACCESS_SECRET, options);
};

export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
  const options: SignOptions = {
    expiresIn: REFRESH_EXPIRY,
  };
  return jwt.sign(payload, REFRESH_SECRET, options);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Access token has expired', StatusCodes.UNAUTHORIZED);
    }
    throw new AppError('Invalid access token', StatusCodes.UNAUTHORIZED);
  }
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    return jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Refresh token has expired. Please log in again.', StatusCodes.UNAUTHORIZED);
    }
    throw new AppError('Invalid refresh token', StatusCodes.UNAUTHORIZED);
  }
};
