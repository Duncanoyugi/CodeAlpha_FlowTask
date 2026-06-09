import { Router } from 'express';
import { SearchController } from './search.controller';
import { authMiddleware } from '../../../src/middleware/auth.middleware';
import { workspaceAccessMiddleware } from '../../../src/middleware/workspace.middleware';

const router = Router({ mergeParams: true });
const searchController = new SearchController();

router.use(authMiddleware);
router.use(workspaceAccessMiddleware);

router.get('/global', searchController.globalSearch);
router.get('/tasks', searchController.searchTasks);

export default router;