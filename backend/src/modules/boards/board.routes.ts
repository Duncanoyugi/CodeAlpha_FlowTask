import { Router } from 'express';
import { BoardController } from './board.controller';
import { validate } from '../../../src/middleware/validation.middleware';
import {
  CreateBoardSchema,
  UpdateBoardSchema,
  BoardIdSchema,
} from './board.schema';
import { authMiddleware } from '../../../src/middleware/auth.middleware';
import { workspaceAccessMiddleware } from '../../../src/middleware/workspace.middleware';

const router = Router({ mergeParams: true });
const boardController = new BoardController();

// All board routes require authentication and workspace access
router.use(authMiddleware);
router.use(workspaceAccessMiddleware);

// Board CRUD
router.post('/', validate(CreateBoardSchema), boardController.createBoard);
router.get('/', boardController.getProjectBoards);
router.get('/:boardId', validate(BoardIdSchema), boardController.getBoard);
router.patch('/:boardId', validate(UpdateBoardSchema), boardController.updateBoard);
router.delete('/:boardId', validate(BoardIdSchema), boardController.deleteBoard);

export default router;