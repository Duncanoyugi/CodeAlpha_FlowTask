import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import workspaceRoutes from '../modules/workspaces/workspace.routes';
import projectRoutes from '../modules/projects/project.routes';
import boardRoutes from '../modules/boards/board.routes';
import columnRoutes from '../modules/columns/column.routes';
import taskRoutes from '../modules/tasks/task.routes';
import commentRoutes from '../modules/comments/comment.routes';
import activityRoutes from '../modules/activities/activity.routes';
import notificationRoutes from '../modules/notifications/notification.routes';
import inviteRoutes from '../modules/invites/invite.routes';
import searchRoutes from '../modules/search/search.routes';
import dashboardRoutes from '../modules/dashboard';


const router = Router();

// Mount modules
router.use('/auth', authRoutes);
router.use('/workspaces', workspaceRoutes);
router.use('/workspaces/:workspaceId/projects', projectRoutes);
router.use('/workspaces/:workspaceId/projects/:projectId/boards', boardRoutes);
router.use('/workspaces/:workspaceId/projects/:projectId/boards/:boardId/columns', columnRoutes);
router.use('/workspaces/:workspaceId/projects/:projectId/boards/:boardId/columns/:columnId/tasks', taskRoutes);
router.use('/workspaces/:workspaceId/projects/:projectId/boards/:boardId/columns/:columnId/tasks/:taskId/comments', commentRoutes);
router.use('/workspaces/:workspaceId/activities', activityRoutes);
router.use('/workspaces/:workspaceId/search', searchRoutes);
router.use('/notifications', notificationRoutes);
router.use('/', inviteRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'TaskFlow API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

export default router;