"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const board_controller_1 = require("./board.controller");
const validation_middleware_1 = require("../../../src/middleware/validation.middleware");
const board_schema_1 = require("./board.schema");
const auth_middleware_1 = require("../../../src/middleware/auth.middleware");
const workspace_middleware_1 = require("../../../src/middleware/workspace.middleware");
const router = (0, express_1.Router)({ mergeParams: true });
const boardController = new board_controller_1.BoardController();
// All board routes require authentication and workspace access
router.use(auth_middleware_1.authMiddleware);
router.use(workspace_middleware_1.workspaceAccessMiddleware);
// Board CRUD
router.post('/', (0, validation_middleware_1.validate)(board_schema_1.CreateBoardSchema), boardController.createBoard);
router.get('/', boardController.getProjectBoards);
router.get('/:boardId', (0, validation_middleware_1.validate)(board_schema_1.BoardIdSchema), boardController.getBoard);
router.patch('/:boardId', (0, validation_middleware_1.validate)(board_schema_1.UpdateBoardSchema), boardController.updateBoard);
router.delete('/:boardId', (0, validation_middleware_1.validate)(board_schema_1.BoardIdSchema), boardController.deleteBoard);
exports.default = router;
