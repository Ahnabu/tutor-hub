import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validate.js';
import {
  reviewVerificationSchema,
  updateSystemConfigSchema,
} from '../schemas/admin.schema.js';
import { UserRole } from '../enums/index.js';

const router = Router();

// All admin routes require ADMIN role
router.use(authenticate, authorizeRoles(UserRole.ADMIN));

// 1. Platform KPIs
router.get('/stats', AdminController.getStats);

// 2. Teacher Verification Queue
router.get('/verifications', AdminController.getPendingVerifications);
router.post(
  '/verifications/:teacherId/review',
  validateRequest({ body: reviewVerificationSchema }),
  AdminController.reviewVerification
);

// 3. Tuition Audits
router.get('/tuitions', AdminController.getTuitionAudits);

// 4. System Configuration & Maintenance Mode
router.get('/config', AdminController.getSystemConfig);
router.patch(
  '/config',
  validateRequest({ body: updateSystemConfigSchema }),
  AdminController.updateSystemConfig
);

// 5. Audit Log Viewer
router.get('/audit-logs', AdminController.getAuditLogs);

export const adminRoutes = router;
