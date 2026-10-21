import { Router } from 'express';
import { TuitionController } from '../controllers/tuition.controller.js';
import { SessionController } from '../controllers/session.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validate.js';
import { UserRole } from '../enums/index.js';
import {
  createTuitionSchema,
  updateTuitionSchema,
  recordPaymentSchema,
  generateShareTokenSchema,
} from '../schemas/tuition.schema.js';
import {
  createSessionSchema,
  updateSessionSchema,
} from '../schemas/session.schema.js';

const router = Router();

// Enforce authentication & teacher role for all tuition operations
router.use(authenticate, authorizeRoles(UserRole.TEACHER));

// --- Tuition CRUD ---
router.post('/', validateRequest({ body: createTuitionSchema }), TuitionController.createTuition);
router.get('/', TuitionController.getTeacherTuitions);
router.get('/:id', TuitionController.getTuitionById);
router.patch('/:id', validateRequest({ body: updateTuitionSchema }), TuitionController.updateTuition);
router.post('/:id/share-token', validateRequest({ body: generateShareTokenSchema }), TuitionController.generateShareToken);
router.post('/:id/record-payment', validateRequest({ body: recordPaymentSchema }), TuitionController.recordPayment);
router.post('/:id/archive', TuitionController.archiveTuition);

// --- Session Logs & Next-Day Memory Prefill ---
router.get('/:id/sessions/prefill', SessionController.getNextDayMemoryPrefill);
router.post('/:id/sessions', validateRequest({ body: createSessionSchema }), SessionController.logSession);
router.get('/:id/sessions', SessionController.getTuitionSessions);
router.patch('/:id/sessions/:sessionId', validateRequest({ body: updateSessionSchema }), SessionController.updateSession);

export const tuitionRoutes = router;
