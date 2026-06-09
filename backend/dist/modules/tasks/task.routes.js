"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const task_controller_1 = require("./task.controller");
const validation_middleware_1 = require("../../../src/middleware/validation.middleware");
const task_schema_1 = require("./task.schema");
const auth_middleware_1 = require("../../../src/middleware/auth.middleware");
const workspace_middleware_1 = require("../../../src/middleware/workspace.middleware");
const router = (0, express_1.Router)({ mergeParams: true });
const taskController = new task_controller_1.TaskController();
// All task routes require authentication and workspace access
router.use(auth_middleware_1.authMiddleware);
router.use(workspace_middleware_1.workspaceAccessMiddleware);
// Task CRUD
router.post('/', (0, validation_middleware_1.validate)(task_schema_1.CreateTaskSchema), taskController.createTask);
router.get('/', taskController.getColumnTasks);
router.get('/board/:boardId', taskController.getBoardTasks);
router.get('/my-tasks', taskController.getUserTasks);
router.get('/:taskId', (0, validation_middleware_1.validate)(task_schema_1.TaskIdSchema), taskController.getTask);
router.patch('/:taskId', (0, validation_middleware_1.validate)(task_schema_1.UpdateTaskSchema), taskController.updateTask);
router.post('/:taskId/move', (0, validation_middleware_1.validate)(task_schema_1.MoveTaskSchema), taskController.moveTask);
router.delete('/:taskId', (0, validation_middleware_1.validate)(task_schema_1.TaskIdSchema), taskController.deleteTask);
// Task reordering
router.post('/column/:columnId/reorder', taskController.reorderTasks);
exports.default = router;
