import jwt, { SignOptions } from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../middleware/error.middleware';
import { TokenPayload, RefreshTokenPayload } from '../types';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_SECRET || ACCESS_SECRET.length < 32) {
  throw new Error(
    'FATAL SECURITY CONFIGURATION ERROR: JWT_ACCESS_SECRET must be defined in environment variables and must be at least 32 characters long.'
  );
}

if (!REFRESH_SECRET || REFRESH_SECRET.length < 32) {
  throw new Error(
    'FATAL SECURITY CONFIGURATION ERROR: JWT_REFRESH_SECRET must be defined in environment variables and must be at least 32 characters long.'
  );
}

const ACCESS_EXPIRY = (process.env.JWT_ACCESS_EXPIRY || '15m') as any;
const REFRESH_EXPIRY = (process.env.JWT_REFRESH_EXPIRY || '7d') as any;

const JWT_ISSUER = 'edutradefx';
const JWT_AUDIENCE = 'edutradefx-app';

export const generateAccessToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    algorithm: 'HS256',
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    expiresIn: ACCESS_EXPIRY,
  };
  return jwt.sign(payload, ACCESS_SECRET, options);
};

export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
  const options: SignOptions = {
    algorithm: 'HS256',
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    expiresIn: REFRESH_EXPIRY,
  };
  return jwt.sign(payload, REFRESH_SECRET, options);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, ACCESS_SECRET, {
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as TokenPayload;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Access token has expired', StatusCodes.UNAUTHORIZED);
    }
    throw new AppError('Invalid access token', StatusCodes.UNAUTHORIZED);
  }
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    return jwt.verify(token, REFRESH_SECRET, {
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as RefreshTokenPayload;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Refresh token has expired. Please log in again.', StatusCodes.UNAUTHORIZED);
    }
    throw new AppError('Invalid refresh token', StatusCodes.UNAUTHORIZED);
  }
};
