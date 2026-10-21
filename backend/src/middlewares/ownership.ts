import { Request, Response, NextFunction } from 'express';
import { Tuition, ITuition } from '../models/Tuition.js';
import { NotFoundError, ForbiddenError, UnauthorizedError } from '../utils/errors.js';
import { UserRole } from '../enums/index.js';

// Extend Express Request to include loaded tuition
declare global {
  namespace Express {
    interface Request {
      tuition?: ITuition;
    }
  }
}

export const loadOwnedTuition = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required', 'AUTH_REQUIRED'));
    }

    const tuitionId = req.params.tuitionId || req.params.id;
    if (!tuitionId) {
      return next(new NotFoundError('Tuition ID missing in request parameters', 'ID_MISSING'));
    }

    const tuition = await Tuition.findById(tuitionId);
    if (!tuition || tuition.deletedAt) {
      return next(new NotFoundError('Tuition not found or has been deleted', 'TUITION_NOT_FOUND'));
    }

    const isAdmin = req.user.roles.includes(UserRole.ADMIN);
    const isOwnerTeacher = tuition.teacherId.toString() === req.user._id.toString();
    const isLinkedGuardian =
      tuition.guardianAccess.guardianUserId &&
      tuition.guardianAccess.guardianUserId.toString() === req.user._id.toString();

    if (!isAdmin && !isOwnerTeacher && !isLinkedGuardian) {
      return next(
        new ForbiddenError(
          'You do not have access to this tuition',
          'ACCESS_DENIED'
        )
      );
    }

    req.tuition = tuition;
    next();
  } catch (error) {
    next(error);
  }
};
