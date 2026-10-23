import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const isProduction = env.NODE_ENV === 'production';
const isTest = env.NODE_ENV === 'test';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: isTest ? 10000 : isProduction ? 300 : 5000,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
  validate: { xForwardedForHeader: false },
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this network. Please wait a moment and try again.',
    },
  },
});

export const authLimiter = rateLimit({
  windowMs: isProduction ? 15 * 60 * 1000 : 60 * 1000, // 15m in prod, 1m in dev
  limit: isTest ? 1000 : isProduction ? 30 : 500,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
  validate: { xForwardedForHeader: false },
  message: {
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please wait a moment and try again.',
    },
  },
});

export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isTest ? 1000 : isProduction ? 50 : 500,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
  validate: { xForwardedForHeader: false },
  message: {
    error: {
      code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
      message: 'Too many upload requests. Please wait a moment and try again.',
    },
  },
});
