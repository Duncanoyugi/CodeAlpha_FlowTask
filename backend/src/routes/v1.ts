import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import workspaceRoutes from '../modules/workspaces/workspace.routes';

const router = Router();

// Mount modules
router.use('/auth', authRoutes);
router.use('/workspaces', workspaceRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;