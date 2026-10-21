import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors.js';
import { env } from '../config/env.js';

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

export const csrfProtection = (req: Request, _res: Response, next: NextFunction): void => {
  // Safe read-only HTTP methods do not require CSRF header check
  if (SAFE_METHODS.includes(req.method)) {
    return next();
  }

  // Exempt during automated tests if configured
  if (env.NODE_ENV === 'test' && req.headers['x-bypass-csrf'] === 'true') {
    return next();
  }

  // 1. Mandatory Custom Header Check
  const requestedWith = req.headers['x-requested-with'];
  if (requestedWith !== 'tutorhub') {
    return next(
      new ForbiddenError(
        'Invalid or missing CSRF security header (X-Requested-With: tutorhub required)',
        'CSRF_HEADER_MISSING'
      )
    );
  }

  // 2. Origin / Referer validation if provided
  const origin = req.headers.origin;
  if (origin && env.NODE_ENV === 'production') {
    const allowedOrigin = env.CORS_ORIGIN;
    if (origin !== allowedOrigin) {
      return next(
        new ForbiddenError('Cross-origin request rejected', 'CSRF_ORIGIN_INVALID')
      );
    }
  }

  next();
};
