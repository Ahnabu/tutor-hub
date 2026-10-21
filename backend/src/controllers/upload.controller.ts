import { Request, Response, NextFunction } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';
import { UploadPurpose } from '../enums/index.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export class UploadController {
  static async getSignature(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { purpose } = req.body;
      const userId = req.user!._id.toString();

      // Server enforces strict folder path
      const folder = `tutorhub/${purpose.toLowerCase()}/${userId}`;
      const timestamp = Math.round(Date.now() / 1000);

      // Sensitive documents use authenticated access type
      const accessMode =
        purpose === UploadPurpose.VERIFICATION_DOC ? 'authenticated' : 'upload';

      const paramsToSign: Record<string, string | number> = {
        folder,
        timestamp,
      };

      if (accessMode === 'authenticated') {
        paramsToSign.type = 'authenticated';
      }

      const signature = cloudinary.utils.api_sign_request(
        paramsToSign,
        env.CLOUDINARY_API_SECRET
      );

      res.status(200).json({
        data: {
          signature,
          timestamp,
          folder,
          apiKey: env.CLOUDINARY_API_KEY,
          cloudName: env.CLOUDINARY_CLOUD_NAME,
          accessMode,
          expiresInSeconds: 60,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
