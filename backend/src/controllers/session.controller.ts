import { Request, Response, NextFunction } from 'express';
import { SessionService } from '../services/session.service.js';

export class SessionController {
  static async getNextDayMemoryPrefill(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherId = req.user!._id.toString();
      const tuitionId = req.params.id as string;
      const prefill = await SessionService.getNextDayMemoryPrefill(teacherId, tuitionId);
      res.status(200).json({
        success: true,
        data: prefill,
      });
    } catch (err) {
      next(err);
    }
  }

  static async logSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherId = req.user!._id.toString();
      const tuitionId = req.params.id as string;
      const session = await SessionService.logSession(teacherId, tuitionId, req.body);
      res.status(201).json({
        success: true,
        data: { session },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getTuitionSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherId = req.user!._id.toString();
      const tuitionId = req.params.id as string;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const result = await SessionService.getTuitionSessions(teacherId, tuitionId, page, limit);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherId = req.user!._id.toString();
      const tuitionId = req.params.id as string;
      const sessionId = req.params.sessionId as string;
      const session = await SessionService.updateSession(
        teacherId,
        tuitionId,
        sessionId,
        req.body
      );
      res.status(200).json({
        success: true,
        data: { session },
      });
    } catch (err) {
      next(err);
    }
  }
}
