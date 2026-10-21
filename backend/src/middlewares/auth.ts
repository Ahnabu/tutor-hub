import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/crypto.js';
import { ACCESS_TOKEN_COOKIE } from '../utils/cookies.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import { User, IUser } from '../models/User.js';
import { UserRole, AccountStatus } from '../enums/index.js';

// Extend Express Request interface to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined = req.cookies?.[ACCESS_TOKEN_COOKIE];

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedError('Authentication token missing', 'TOKEN_MISSING');
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw new UnauthorizedError('Invalid or expired authentication token', 'TOKEN_EXPIRED');
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedError('User not found', 'USER_NOT_FOUND');
    }

    // Check account status
    if (user.accountStatus === AccountStatus.SUSPENDED) {
      throw new ForbiddenError(
        user.suspensionReason || 'Account suspended',
        'ACCOUNT_SUSPENDED'
      );
    }

    if (user.accountStatus !== AccountStatus.ACTIVE) {
      throw new ForbiddenError(
        'Account is not active or verified',
        'ACCOUNT_NOT_ACTIVE'
      );
    }

    // Check tokenVersion match (invalidated on password change or suspension)
    if (user.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedError('Session has been revoked', 'SESSION_REVOKED');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required', 'AUTH_REQUIRED'));
    }

    const hasRole = req.user.roles.some((role) => roles.includes(role));
    if (!hasRole) {
      return next(
        new ForbiddenError(
          'You do not have permission to perform this action',
          'INSUFFICIENT_PERMISSIONS'
        )
      );
    }

    next();
  };
};
