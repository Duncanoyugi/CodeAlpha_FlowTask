import { Router } from 'express';
import { ColumnController } from './column.controller';
import { validate } from '../../../src/middleware/validation.middleware';
import {
  CreateColumnSchema,
  UpdateColumnSchema,
  ColumnIdSchema,
  ReorderColumnsSchema,
} from './column.schema';
import { authMiddleware } from '../../../src/middleware/auth.middleware';
import { workspaceAccessMiddleware } from '../../../src/middleware/workspace.middleware';

const router = Router({ mergeParams: true });
const columnController = new ColumnController();

// All column routes require authentication and workspace access
router.use(authMiddleware);
router.use(workspaceAccessMiddleware);

// Column CRUD
router.post('/', validate(CreateColumnSchema), columnController.createColumn);
router.get('/', columnController.getBoardColumns);
router.get('/:columnId', validate(ColumnIdSchema), columnController.getColumn);
router.patch('/:columnId', validate(UpdateColumnSchema), columnController.updateColumn);
router.delete('/:columnId', validate(ColumnIdSchema), columnController.deleteColumn);

// Column reordering
router.post('/reorder', validate(ReorderColumnsSchema), columnController.reorderColumns);

export default router;