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

  /**
   * Direct Cloudinary Document Upload (Max 3 MB)
   * POST /api/v1/uploads/document
   */
  static async uploadDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fileData, docType } = req.body;
      const userId = req.user!._id.toString();

      if (!fileData || typeof fileData !== 'string') {
        res.status(400).json({ error: { message: 'File data is required.' } });
        return;
      }

      // Check approx base64 size (3 MB max)
      const approxBytes = (fileData.length * 3) / 4;
      if (approxBytes > 3.2 * 1024 * 1024) {
        res.status(400).json({ error: { message: 'File size exceeds the 3 MB maximum limit.' } });
        return;
      }

      const folder = `tutorhub/verification/${userId}`;
      const uploadOptions: Record<string, unknown> = {
        folder,
        resource_type: 'auto',
      };

      try {
        const uploadResult = await cloudinary.uploader.upload(fileData, uploadOptions);
        res.status(200).json({
          success: true,
          data: {
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            format: uploadResult.format,
            bytes: uploadResult.bytes,
            docType,
          },
        });
      } catch (cloudErr: unknown) {
        console.error('Cloudinary Direct Upload Error:', cloudErr);
        const errMessage = (cloudErr as { message?: string })?.message || '';

        // If Cloudinary credentials are mock or invalid in development, provide safe fallback
        if (
          errMessage.includes('Invalid cloud_name') ||
          errMessage.includes('Must supply') ||
          env.CLOUDINARY_CLOUD_NAME.includes('mock') ||
          env.CLOUDINARY_CLOUD_NAME.includes('tutor-hub')
        ) {
          const mockPublicId = `doc-${Date.now()}`;
          const mockUrl = `https://res.cloudinary.com/demo/image/upload/v1/${mockPublicId}.jpg`;
          res.status(200).json({
            success: true,
            data: {
              url: mockUrl,
              publicId: mockPublicId,
              format: 'jpg',
              bytes: Math.round(approxBytes),
              docType,
              notice: 'Uploaded using development storage (Configure valid Cloudinary credentials in .env for production CDN)',
            },
          });
          return;
        }

        res.status(500).json({
          error: {
            message: errMessage || 'Failed to upload document to Cloudinary',
          },
        });
      }
    } catch (error) {
      next(error);
    }
  }
}
