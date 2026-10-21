import { Router } from 'express';
import { TeacherController } from '../controllers/teacher.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validate.js';
import { updateTeacherProfileSchema, submitVerificationSchema } from '../schemas/teacher.schema.js';
import { UserRole } from '../enums/index.js';

const router = Router();

// Public routes (Teacher directory & profiles)
router.get('/', TeacherController.getPublicDirectory);
router.get('/:identifier', TeacherController.getPublicTeacher);

// Authenticated teacher management routes
router.patch(
  '/profile',
  authenticate,
  authorizeRoles(UserRole.TEACHER),
  validateRequest({ body: updateTeacherProfileSchema }),
  TeacherController.updateProfile
);

router.post(
  '/verification',
  authenticate,
  authorizeRoles(UserRole.TEACHER),
  validateRequest({ body: submitVerificationSchema }),
  TeacherController.submitVerification
);

export const teacherRoutes = router;
