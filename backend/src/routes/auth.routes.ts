import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validateRequest } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimit.js';
import {
  registerSchema,
  verifyEmailSchema,
  resendOtpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  claimStartSchema,
  claimVerifySchema,
} from '../schemas/auth.schema.js';

const router = Router();

router.post(
  '/register',
  authLimiter,
  validateRequest({ body: registerSchema }),
  AuthController.register
);

router.post(
  '/verify-email',
  authLimiter,
  validateRequest({ body: verifyEmailSchema }),
  AuthController.verifyEmail
);

router.post(
  '/resend-otp',
  authLimiter,
  validateRequest({ body: resendOtpSchema }),
  AuthController.resendOtp
);

router.post(
  '/login',
  authLimiter,
  validateRequest({ body: loginSchema }),
  AuthController.login
);

router.post('/refresh', AuthController.refresh);

router.post('/logout', AuthController.logout);

router.post('/logout-all', authenticate, AuthController.logoutAll);

router.post(
  '/forgot-password',
  authLimiter,
  validateRequest({ body: forgotPasswordSchema }),
  AuthController.forgotPassword
);

router.post(
  '/reset-password',
  authLimiter,
  validateRequest({ body: resetPasswordSchema }),
  AuthController.resetPassword
);

router.post(
  '/change-password',
  authenticate,
  validateRequest({ body: changePasswordSchema }),
  AuthController.changePassword
);

router.get('/me', authenticate, AuthController.getMe);

router.post(
  '/claim-guardian/start',
  authLimiter,
  validateRequest({ body: claimStartSchema }),
  AuthController.claimStart
);

router.post(
  '/claim-guardian/verify',
  authLimiter,
  validateRequest({ body: claimVerifySchema }),
  AuthController.claimVerify
);

router.get('/export-data', authenticate, AuthController.exportData);
router.post('/delete-account', authenticate, AuthController.deleteAccount);

export const authRoutes = router;

