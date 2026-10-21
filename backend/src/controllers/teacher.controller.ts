import { Request, Response, NextFunction } from 'express';
import { TeacherService } from '../services/teacher.service.js';
import { IUser } from '../models/User.js';

export class TeacherController {
  /**
   * PATCH /api/v1/teachers/profile
   */
  static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as IUser;
      const updatedUser = await TeacherService.updateProfile(user._id.toString(), req.body);

      res.status(200).json({
        success: true,
        data: { user: updatedUser },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/teachers/verification
   */
  static async submitVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as IUser;
      const result = await TeacherService.submitVerificationDocs(
        user._id.toString(),
        req.body.docs
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
   * GET /api/v1/teachers (Public Directory)
   */
  static async getPublicDirectory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, subject, area, page, limit } = req.query;

      const result = await TeacherService.getPublicDirectory({
        search: search as string,
        subject: subject as string,
        area: area as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/teachers/:identifier (Public Profile)
   */
  static async getPublicTeacher(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const identifier = req.params.identifier as string;
      const teacher = await TeacherService.getPublicTeacher(identifier);

      res.status(200).json({
        success: true,
        data: { teacher },
      });
    } catch (err) {
      next(err);
    }
  }
}
