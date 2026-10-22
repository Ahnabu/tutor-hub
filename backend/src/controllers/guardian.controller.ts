import { Request, Response, NextFunction } from 'express';
import { GuardianService } from '../services/guardian.service.js';
import { IUser } from '../models/User.js';
import { baseCookieOptions } from '../utils/cookies.js';

export class GuardianController {
  /**
   * POST /api/v1/guardian/view/:token/verify-pin
   */
  static async verifyPin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.params.token as string;
      const { pin } = req.body;

      const result = await GuardianService.verifyPin(token, pin);

      // Set httpOnly cookie for 7 days
      res.cookie('guardian_view_token', result.viewToken, {
        ...baseCookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        data: {
          tuitionId: result.tuitionId,
          viewToken: result.viewToken,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/guardian/view/:token
   */
  static async getTuitionByShareToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.params.token as string;
      const viewSessionToken =
        (req.cookies?.guardian_view_token as string) ||
        (req.headers['x-guardian-view-token'] as string);

      const result = await GuardianService.getTuitionByShareToken(token, viewSessionToken);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/guardian/tuitions
   */
  static async getClaimedTuitions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as IUser;
      const tuitions = await GuardianService.getClaimedGuardianTuitions(user);

      res.status(200).json({
        success: true,
        data: { tuitions },
      });
    } catch (err) {
      next(err);
    }
  }
}
