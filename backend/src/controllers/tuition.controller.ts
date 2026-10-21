import { Request, Response, NextFunction } from 'express';
import { TuitionService } from '../services/tuition.service.js';
import { TuitionStatus } from '../enums/index.js';

export class TuitionController {
  static async createTuition(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherId = req.user!._id.toString();
      const tuition = await TuitionService.createTuition(teacherId, req.body);
      res.status(201).json({
        success: true,
        data: { tuition },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getTeacherTuitions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherId = req.user!._id.toString();
      const status = req.query.status as TuitionStatus | undefined;
      const tuitions = await TuitionService.getTeacherTuitions(teacherId, status);
      res.status(200).json({
        success: true,
        data: { tuitions },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getTuitionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherId = req.user!._id.toString();
      const tuitionId = req.params.id as string;
      const tuition = await TuitionService.getTuitionById(teacherId, tuitionId);
      res.status(200).json({
        success: true,
        data: { tuition },
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateTuition(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherId = req.user!._id.toString();
      const tuitionId = req.params.id as string;
      const tuition = await TuitionService.updateTuition(teacherId, tuitionId, req.body);
      res.status(200).json({
        success: true,
        data: { tuition },
      });
    } catch (err) {
      next(err);
    }
  }

  static async generateShareToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherId = req.user!._id.toString();
      const tuitionId = req.params.id as string;
      const { accessPin } = req.body;
      const shareData = await TuitionService.generateGuardianShareToken(
        teacherId,
        tuitionId,
        accessPin
      );
      res.status(200).json({
        success: true,
        data: shareData,
      });
    } catch (err) {
      next(err);
    }
  }

  static async recordPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherId = req.user!._id.toString();
      const tuitionId = req.params.id as string;
      const tuition = await TuitionService.recordPayment(teacherId, tuitionId, req.body);
      res.status(200).json({
        success: true,
        data: { tuition },
      });
    } catch (err) {
      next(err);
    }
  }

  static async archiveTuition(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacherId = req.user!._id.toString();
      const tuitionId = req.params.id as string;
      const tuition = await TuitionService.archiveTuition(teacherId, tuitionId);
      res.status(200).json({
        success: true,
        data: { tuition },
      });
    } catch (err) {
      next(err);
    }
  }
}
