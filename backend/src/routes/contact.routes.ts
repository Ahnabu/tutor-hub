import { Router } from 'express';
import { ContactController } from '../controllers/contact.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validate.js';
import {
  createContactRequestSchema,
  respondContactRequestSchema,
} from '../schemas/contactRequest.schema.js';
import { UserRole } from '../enums/index.js';

const router = Router();

// Guardian requests contact
router.post(
  '/',
  authenticate,
  authorizeRoles(UserRole.GUARDIAN),
  validateRequest({ body: createContactRequestSchema }),
  ContactController.requestContact
);

// Guardian views sent requests
router.get(
  '/mine',
  authenticate,
  authorizeRoles(UserRole.GUARDIAN),
  ContactController.getGuardianRequests
);

// Guardian views revealed contact after approval
router.get(
  '/revealed/:teacherId',
  authenticate,
  authorizeRoles(UserRole.GUARDIAN),
  ContactController.getRevealedContact
);

// Teacher views incoming requests
router.get(
  '/incoming',
  authenticate,
  authorizeRoles(UserRole.TEACHER),
  ContactController.getTeacherIncomingRequests
);

// Teacher responds to request (APPROVE or REJECT)
router.post(
  '/:id/respond',
  authenticate,
  authorizeRoles(UserRole.TEACHER),
  validateRequest({ body: respondContactRequestSchema }),
  ContactController.respondToRequest
);

export const contactRoutes = router;
