import { Router } from 'express';
import { ActivityController } from './activity.controller';
import { authMiddleware } from '../../../src/middleware/auth.middleware';
import { workspaceAccessMiddleware } from '../../../src/middleware/workspace.middleware';

const router = Router({ mergeParams: true });
const activityController = new ActivityController();

// All activity routes require authentication and workspace access
router.use(authMiddleware);
router.use(workspaceAccessMiddleware);

router.get('/workspace', activityController.getWorkspaceActivities);
router.get('/projects/:projectId', activityController.getProjectActivities);
router.get('/tasks/:taskId', activityController.getTaskActivities);

export default router;