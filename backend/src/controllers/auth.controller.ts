import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { setAuthCookies, clearAuthCookies, REFRESH_TOKEN_COOKIE } from '../utils/cookies.js';
import { toUserDTO } from '../dtos/user.dto.js';
import { BadRequestError } from '../utils/errors.js';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, otp } = req.body;
      const result = await AuthService.verifyEmail(
        email,
        otp,
        req.headers['user-agent'],
        req.ip
      );

      setAuthCookies(res, result.accessToken, result.refreshToken);

      res.status(200).json({
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.resendOtp(req.body.email);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { identifier, password } = req.body;
      const result = await AuthService.login(
        identifier,
        password,
        req.headers['user-agent'],
        req.ip
      );

      setAuthCookies(res, result.accessToken, result.refreshToken);

      res.status(200).json({
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies?.[REFRESH_TOKEN_COOKIE] || req.body?.refreshToken;
      if (!token) {
        throw new BadRequestError('Refresh token required', 'REFRESH_TOKEN_REQUIRED');
      }

      const result = await AuthService.refresh(
        token,
        req.headers['user-agent'],
        req.ip
      );

      setAuthCookies(res, result.accessToken, result.refreshToken);

      res.status(200).json({
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies?.[REFRESH_TOKEN_COOKIE];
      await AuthService.logout(token);
      clearAuthCookies(res);
      res.status(200).json({ data: { message: 'Logged out successfully' } });
    } catch (error) {
      next(error);
    }
  }

  static async logoutAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await AuthService.logoutAll(req.user!._id.toString());
      clearAuthCookies(res);
      res.status(200).json({ data: { message: 'Logged out of all sessions successfully' } });
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.forgotPassword(req.body.email);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      const result = await AuthService.resetPassword(token, newPassword);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      data: {
        user: toUserDTO(req.user!),
      },
    });
  }

  static async claimStart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.claimGuardianStart(req.body.claimToken);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async claimVerify(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { claimToken, otp, password } = req.body;
      const result = await AuthService.claimGuardianVerify(
        claimToken,
        otp,
        password,
        req.headers['user-agent'],
        req.ip
      );

      setAuthCookies(res, result.accessToken, result.refreshToken);

      res.status(200).json({
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
