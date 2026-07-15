import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { DashboardController } from './dashboard.controller';
import { validate } from '../../middleware/validation.middleware';

const router = Router();
const controller = new DashboardController();

router.use(authMiddleware);

// Admin dashboard
router.get(
  '/workspaces/:workspaceId/dashboard/admin',
  controller.getAdminDashboard.bind(controller),
);

// Member dashboard
router.get(
  '/users/me/dashboard/member',
  controller.getMemberDashboard.bind(controller),
);

export default router;

