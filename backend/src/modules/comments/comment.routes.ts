import { Router } from 'express';
import { CommentController } from './comment.controller';
import { validate } from '../../../src/middleware/validation.middleware';
import {
  CreateCommentSchema,
  UpdateCommentSchema,
  CommentIdSchema,
} from './comment.schema';
import { authMiddleware } from '../../../src/middleware/auth.middleware';
import { workspaceAccessMiddleware } from '../../../src/middleware/workspace.middleware';

const router = Router({ mergeParams: true });
const commentController = new CommentController();

// All comment routes require authentication and workspace access
router.use(authMiddleware);
router.use(workspaceAccessMiddleware);

// Comment CRUD
router.post('/', validate(CreateCommentSchema), commentController.createComment);
router.get('/', commentController.getTaskComments);
router.get('/:commentId', validate(CommentIdSchema), commentController.getComment);
router.patch('/:commentId', validate(UpdateCommentSchema), commentController.updateComment);
router.delete('/:commentId', validate(CommentIdSchema), commentController.deleteComment);

export default router;