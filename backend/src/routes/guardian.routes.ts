import { Router } from 'express';
import { GuardianController } from '../controllers/guardian.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validate.js';
import { verifySharePinSchema } from '../schemas/guardian.schema.js';
import { UserRole } from '../enums/index.js';

const router = Router();

// Public / PIN-protected view routes
router.post('/view/:token/verify-pin', validateRequest({ body: verifySharePinSchema }), GuardianController.verifyPin);
router.get('/view/:token', GuardianController.getTuitionByShareToken);

// Claimed Guardian authenticated dashboard
router.get('/tuitions', authenticate, authorizeRoles(UserRole.GUARDIAN), GuardianController.getClaimedTuitions);

export const guardianRoutes = router;
