import argon2 from 'argon2';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UserRole } from '../enums/index.js';

export interface IAccessTokenPayload {
  sub: string;
  roles: UserRole[];
  tokenVersion: number;
}

export interface IRefreshTokenPayload {
  sub: string;
  familyId: string;
}

/**
 * Hash a plain text password using Argon2id
 */
export const hashPassword = async (password: string): Promise<string> => {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
  });
};

/**
 * Verify a plain text password against an Argon2id hash
 */
export const verifyPassword = async (hash: string, plain: string): Promise<boolean> => {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
};

/**
 * Fast SHA-256 hash for tokens, OTPs, and PINs
 */
export const sha256 = (value: string): string => {
  return crypto.createHash('sha256').update(value).digest('hex');
};

/**
 * Generate a cryptographically secure random token (base64url)
 */
export const generateSecureToken = (bytes = 32): string => {
  return crypto.randomBytes(bytes).toString('base64url');
};

/**
 * Generate a 6-digit numeric OTP
 */
export const generateNumericOtp = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Sign an Access Token (default 15 minutes)
 */
export const signAccessToken = (payload: IAccessTokenPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
  });
};

/**
 * Sign a Refresh Token (default 7 days)
 */
export const signRefreshToken = (payload: IRefreshTokenPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
  });
};

/**
 * Verify an Access Token
 */
export const verifyAccessToken = (token: string): IAccessTokenPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as IAccessTokenPayload;
};

/**
 * Verify a Refresh Token
 */
export const verifyRefreshToken = (token: string): IRefreshTokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as IRefreshTokenPayload;
};
