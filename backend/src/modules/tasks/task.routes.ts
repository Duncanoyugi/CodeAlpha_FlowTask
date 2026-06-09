import { Router } from 'express';
import { TaskController } from './task.controller';
import { validate } from '../../../src/middleware/validation.middleware';
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  TaskIdSchema,
  MoveTaskSchema,
} from './task.schema';
import { authMiddleware } from '../../../src/middleware/auth.middleware';
import { workspaceAccessMiddleware } from '../../../src/middleware/workspace.middleware';

const router = Router({ mergeParams: true });
const taskController = new TaskController();

// All task routes require authentication and workspace access
router.use(authMiddleware);
router.use(workspaceAccessMiddleware);

// Task CRUD
router.post('/', validate(CreateTaskSchema), taskController.createTask);
router.get('/', taskController.getColumnTasks);
router.get('/board/:boardId', taskController.getBoardTasks);
router.get('/my-tasks', taskController.getUserTasks);
router.get('/:taskId', validate(TaskIdSchema), taskController.getTask);
router.patch('/:taskId', validate(UpdateTaskSchema), taskController.updateTask);
router.post('/:taskId/move', validate(MoveTaskSchema), taskController.moveTask);
router.delete('/:taskId', validate(TaskIdSchema), taskController.deleteTask);

// Task reordering
router.post('/column/:columnId/reorder', taskController.reorderTasks);

export default router;