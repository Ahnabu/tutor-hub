import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service.js';
import { IUser } from '../models/User.js';

export class AdminController {
  /**
   * GET /api/v1/admin/stats
   */
  static async getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await AdminService.getPlatformStats();
      res.status(200).json({
        success: true,
        data: { stats },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/verifications
   */
  static async getPendingVerifications(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const verifications = await AdminService.getPendingVerifications();
      res.status(200).json({
        success: true,
        data: { verifications },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/admin/verifications/:teacherId/review
   */
  static async reviewVerification(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const admin = req.user as IUser;
      const teacherId = req.params.teacherId as string;
      const result = await AdminService.reviewVerification(
        admin._id.toString(),
        teacherId,
        req.body
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/tuitions
   */
  static async getTuitionAudits(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await AdminService.getTuitionAudits(page, limit);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/config
   */
  static async getSystemConfig(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const config = await AdminService.getSystemConfig();
      res.status(200).json({
        success: true,
        data: { config },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/admin/config
   */
  static async updateSystemConfig(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const admin = req.user as IUser;
      const config = await AdminService.updateSystemConfig(admin._id.toString(), req.body);

      res.status(200).json({
        success: true,
        data: { config },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/audit-logs
   */
  static async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 30;
      const logs = await AdminService.getRecentAuditLogs(limit);

      res.status(200).json({
        success: true,
        data: { logs },
      });
    } catch (err) {
      next(err);
    }
  }
}
