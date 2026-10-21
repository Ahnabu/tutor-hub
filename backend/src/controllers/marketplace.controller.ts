import { Request, Response, NextFunction } from 'express';
import { MarketplaceService } from '../services/marketplace.service.js';
import { IUser } from '../models/User.js';

export class MarketplaceController {
  /**
   * POST /api/v1/marketplace/posts
   */
  static async createPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as IUser;
      const post = await MarketplaceService.createPost(user._id.toString(), req.body);

      res.status(201).json({
        success: true,
        data: { post },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/marketplace/posts
   */
  static async getPublicPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await MarketplaceService.getPublicPosts(req.query as any);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/marketplace/posts/:id
   */
  static async getPostById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const post = await MarketplaceService.getPostById(id);

      res.status(200).json({
        success: true,
        data: { post },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/marketplace/my-posts
   */
  static async getMyPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as IUser;
      const posts = await MarketplaceService.getMyPosts(user._id.toString());

      res.status(200).json({
        success: true,
        data: { posts },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/marketplace/posts/:id/close
   */
  static async closePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as IUser;
      const id = req.params.id as string;
      await MarketplaceService.closePost(user._id.toString(), id);

      res.status(200).json({
        success: true,
        message: 'Tuition post successfully closed',
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/marketplace/posts/:id/apply
   */
  static async applyToPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as IUser;
      const id = req.params.id as string;
      const application = await MarketplaceService.applyToPost(
        user._id.toString(),
        id,
        req.body.message
      );

      res.status(201).json({
        success: true,
        data: { application },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/marketplace/my-applications
   */
  static async getMyApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as IUser;
      const applications = await MarketplaceService.getMyApplications(user._id.toString());

      res.status(200).json({
        success: true,
        data: { applications },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/marketplace/posts/:id/applications
   */
  static async getPostApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as IUser;
      const id = req.params.id as string;
      const applications = await MarketplaceService.getPostApplications(user._id.toString(), id);

      res.status(200).json({
        success: true,
        data: { applications },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/marketplace/applications/:id/respond
   */
  static async respondToApplication(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user as IUser;
      const id = req.params.id as string;
      const result = await MarketplaceService.respondToApplication(
        user._id.toString(),
        id,
        req.body.action
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}
