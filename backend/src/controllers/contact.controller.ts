import { Request, Response, NextFunction } from 'express';
import { ContactService } from '../services/contact.service.js';
import { IUser } from '../models/User.js';

export class ContactController {
  /**
   * POST /api/v1/contact-requests
   */
  static async requestContact(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as IUser;
      const { targetTeacherId, reasonOrNote } = req.body;

      const request = await ContactService.requestContact(
        user._id.toString(),
        targetTeacherId,
        reasonOrNote
      );

      res.status(201).json({
        success: true,
        data: { request },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/contact-requests/mine (Guardian's sent requests)
   */
  static async getGuardianRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as IUser;
      const requests = await ContactService.getGuardianRequests(user._id.toString());

      res.status(200).json({
        success: true,
        data: { requests },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/contact-requests/incoming (Teacher's incoming requests)
   */
  static async getTeacherIncomingRequests(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user as IUser;
      const requests = await ContactService.getTeacherIncomingRequests(user._id.toString());

      res.status(200).json({
        success: true,
        data: { requests },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/contact-requests/:id/respond
   */
  static async respondToRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as IUser;
      const id = req.params.id as string;
      const { action } = req.body;

      const request = await ContactService.respondToRequest(user._id.toString(), id, action);

      res.status(200).json({
        success: true,
        data: { request },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/contact-requests/revealed/:teacherId
   */
  static async getRevealedContact(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as IUser;
      const teacherId = req.params.teacherId as string;

      const contact = await ContactService.getRevealedContact(user._id.toString(), teacherId);

      res.status(200).json({
        success: true,
        data: { contact },
      });
    } catch (err) {
      next(err);
    }
  }
}
