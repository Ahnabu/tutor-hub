import { z } from 'zod';
import { UserRole, UploadPurpose } from '../enums/index.js';

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Valid email address is required').toLowerCase(),
    phone: z
      .string()
      .regex(/^(\+?880|0)?1[3-9]\d{8}$/, 'Valid Bangladeshi mobile number is required (e.g. 017XXXXXXXX)'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    role: z.enum([UserRole.TEACHER, UserRole.GUARDIAN]),
  })
  .strict();

export const verifyEmailSchema = z
  .object({
    email: z.string().email().toLowerCase(),
    otp: z.string().length(6, 'Verification code must be 6 digits'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
      .optional(),
  })
  .strict();

export const resendOtpSchema = z
  .object({
    email: z.string().email().toLowerCase(),
  })
  .strict();

export const loginSchema = z
  .object({
    identifier: z.string().min(3, 'Email or phone number is required'),
    password: z.string().min(1, 'Password is required'),
  })
  .strict();

export const forgotPasswordSchema = z
  .object({
    email: z.string().email().toLowerCase(),
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    token: z.string().min(10, 'Reset token is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  })
  .strict();

export const claimStartSchema = z
  .object({
    claimToken: z.string().min(10, 'Claim token is required'),
  })
  .strict();

export const claimVerifySchema = z
  .object({
    claimToken: z.string().min(10, 'Claim token is required'),
    otp: z.string().length(6, 'Verification code must be 6 digits'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
  })
  .strict();

export const uploadSignatureSchema = z
  .object({
    purpose: z.enum([
      UploadPurpose.SESSION_ATTACHMENT,
      UploadPurpose.AVATAR,
      UploadPurpose.VERIFICATION_DOC,
    ]),
  })
  .strict();
