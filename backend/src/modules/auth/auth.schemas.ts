import { z } from 'zod';
import { Role } from '@prisma/client';
import { isCommonPassword } from '../../utils/password.utils';
import { validatePhoneE164, normalizeToE164 } from '../../utils/phone.utils';

export const passwordValidation = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password cannot exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
  .refine((val) => !isCommonPassword(val), {
    message: 'Password is too common or easily guessable. Please choose a more secure password.',
  });

export const emailValidation = z
  .string()
  .trim()
  .toLowerCase()
  .email('Please enter a valid email address');

export const phoneValidation = z
  .string()
  .min(6, 'Please enter a valid mobile number')
  .max(25)
  .refine((val) => validatePhoneE164(val), {
    message: 'Please provide a valid phone number with country code (e.g. +919876543210)',
  })
  .transform((val) => normalizeToE164(val) || val.trim());

export const checkEmailSchema = z.object({
  email: emailValidation,
});

export const resendVerificationSchema = z.object({
  email: emailValidation,
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
  email: emailValidation,
  password: passwordValidation,
  phone: phoneValidation,
  consent: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the Terms of Service, Privacy Policy, and Risk Disclaimer to register.',
  }),
  consentVersion: z.string().optional().default('1.0'),
  consentAt: z.string().optional(),
});

export const partnerRegisterSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
  email: emailValidation,
  password: passwordValidation,
  role: z.enum([Role.BROKER, Role.SIGNAL_PROVIDER, Role.TUTOR, Role.ACCOUNT_MANAGER], {
    errorMap: () => ({ message: 'Invalid partner role. Allowed: BROKER, SIGNAL_PROVIDER, TUTOR, ACCOUNT_MANAGER' }),
  }),
  phone: phoneValidation,
  companyName: z.string().trim().optional(),
  bio: z.string().trim().optional(),
  website: z.string().trim().url('Website must be a valid URL').optional().or(z.literal('')),
  consent: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the platform partnership terms.',
  }),
  consentVersion: z.string().optional().default('1.0'),
  consentAt: z.string().optional(),
});

export const adminCreateUserSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
  email: emailValidation,
  password: passwordValidation,
  role: z.nativeEnum(Role),
  phone: phoneValidation.optional().nullable(),
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
  email: emailValidation,
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
