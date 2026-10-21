import { Router } from 'express';
import { MarketplaceController } from '../controllers/marketplace.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validate.js';
import {
  createMarketplacePostSchema,
  applyMarketplacePostSchema,
  respondMarketplaceApplicationSchema,
  marketplaceFilterSchema,
} from '../schemas/marketplace.schema.js';
import { UserRole } from '../enums/index.js';

const router = Router();

// 1. Public route - browse marketplace posts
router.get(
  '/posts',
  validateRequest({ query: marketplaceFilterSchema }),
  MarketplaceController.getPublicPosts
);

// 2. Public route - view single post details
router.get('/posts/:id', MarketplaceController.getPostById);

// 3. Guardian post creation
router.post(
  '/posts',
  authenticate,
  validateRequest({ body: createMarketplacePostSchema }),
  MarketplaceController.createPost
);

// 4. Guardian view own posts
router.get(
  '/my-posts',
  authenticate,
  MarketplaceController.getMyPosts
);

// 5. Guardian close post
router.patch(
  '/posts/:id/close',
  authenticate,
  MarketplaceController.closePost
);

// 6. Teacher apply to post
router.post(
  '/posts/:id/apply',
  authenticate,
  authorizeRoles(UserRole.TEACHER),
  validateRequest({ body: applyMarketplacePostSchema }),
  MarketplaceController.applyToPost
);

// 7. Teacher view submitted applications
router.get(
  '/my-applications',
  authenticate,
  authorizeRoles(UserRole.TEACHER),
  MarketplaceController.getMyApplications
);

// 8. Guardian view applicants for their post
router.get(
  '/posts/:id/applications',
  authenticate,
  MarketplaceController.getPostApplications
);

// 9. Guardian respond (accept/reject) to application
router.post(
  '/applications/:id/respond',
  authenticate,
  validateRequest({ body: respondMarketplaceApplicationSchema }),
  MarketplaceController.respondToApplication
);

export const marketplaceRoutes = router;
