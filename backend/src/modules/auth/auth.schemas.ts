import { z } from 'zod';
import { Role } from '@prisma/client';

export const passwordValidation = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: passwordValidation,
  phone: z.string().min(6, 'Please enter a valid mobile number').max(25),
  consent: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the Terms of Service and Privacy Policy to register.',
  }),
});

export const partnerRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: passwordValidation,
  role: z.enum([Role.BROKER, Role.SIGNAL_PROVIDER, Role.TUTOR, Role.ACCOUNT_MANAGER], {
    errorMap: () => ({ message: 'Invalid partner role. Allowed: BROKER, SIGNAL_PROVIDER, TUTOR, ACCOUNT_MANAGER' }),
  }),
  phone: z.string().min(6, 'Please enter a valid phone number').max(25),
  companyName: z.string().optional(),
  bio: z.string().optional(),
  website: z.string().optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the platform partnership terms.',
  }),
});

export const adminCreateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: passwordValidation,
  role: z.nativeEnum(Role),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
  isEmailVerified: z.boolean().default(true),
});

export const loginSchema = z
  .object({
    identifier: z.string().optional(),
    email: z.string().optional(),
    password: z.string().min(1, 'Password is required'),
  })
  .refine((data) => !!(data.identifier || data.email), {
    message: 'Please provide your registered email address or mobile number',
    path: ['identifier'],
  })
  .transform((data) => ({
    identifier: (data.identifier || data.email)!.trim(),
    password: data.password,
  }));

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordValidation,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordValidation,
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New password and confirm password do not match',
    path: ['confirmPassword'],
  });

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});
