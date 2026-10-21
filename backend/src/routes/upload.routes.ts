import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { uploadLimiter } from '../middlewares/rateLimit.js';
import { validateRequest } from '../middlewares/validate.js';
import { uploadSignatureSchema } from '../schemas/auth.schema.js';

const router = Router();

router.post(
  '/signature',
  authenticate,
  uploadLimiter,
  validateRequest({ body: uploadSignatureSchema }),
  UploadController.getSignature
);

router.post(
  '/document',
  authenticate,
  uploadLimiter,
  UploadController.uploadDocument
);

export const uploadRoutes = router;
