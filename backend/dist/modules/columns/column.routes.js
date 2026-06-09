"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const column_controller_1 = require("./column.controller");
const validation_middleware_1 = require("../../../src/middleware/validation.middleware");
const column_schema_1 = require("./column.schema");
const auth_middleware_1 = require("../../../src/middleware/auth.middleware");
const workspace_middleware_1 = require("../../../src/middleware/workspace.middleware");
const router = (0, express_1.Router)({ mergeParams: true });
const columnController = new column_controller_1.ColumnController();
// All column routes require authentication and workspace access
router.use(auth_middleware_1.authMiddleware);
router.use(workspace_middleware_1.workspaceAccessMiddleware);
// Column CRUD
router.post('/', (0, validation_middleware_1.validate)(column_schema_1.CreateColumnSchema), columnController.createColumn);
router.get('/', columnController.getBoardColumns);
router.get('/:columnId', (0, validation_middleware_1.validate)(column_schema_1.ColumnIdSchema), columnController.getColumn);
router.patch('/:columnId', (0, validation_middleware_1.validate)(column_schema_1.UpdateColumnSchema), columnController.updateColumn);
router.delete('/:columnId', (0, validation_middleware_1.validate)(column_schema_1.ColumnIdSchema), columnController.deleteColumn);
// Column reordering
router.post('/reorder', (0, validation_middleware_1.validate)(column_schema_1.ReorderColumnsSchema), columnController.reorderColumns);
exports.default = router;
