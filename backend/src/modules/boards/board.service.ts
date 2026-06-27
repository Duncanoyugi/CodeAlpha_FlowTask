import { BoardRepository } from './board.repository';
import { CreateBoardDto, UpdateBoardDto } from './board.dto';
import { NotFoundError, ForbiddenError } from '../../../src/utils/error';
import { BoardPermissions } from '../../../src/permissions/board.permissions';
import { resolveProjectAccess, resolveBoardAccess } from '../../../src/permissions/access-resolver';

export class BoardService {
  private boardRepository: BoardRepository;

  constructor() {
    this.boardRepository = new BoardRepository();
  }

  async createBoard(projectId: string, userId: string, data: CreateBoardDto) {
    const workspaceAccess = await resolveProjectAccess(projectId, userId);
    if (!BoardPermissions.canManageBoard(workspaceAccess.permissionRole, userId, workspaceAccess.ownerId)) {
      throw new ForbiddenError('You do not have permission to create boards');
    }

    return this.boardRepository.create({
      projectId,
      name: data.name,
    });
  }

  async getBoardById(boardId: string, userId: string) {
    const boardAccess = await resolveBoardAccess(boardId, userId);
    const board = await this.boardRepository.findById(boardId);
    if (!board) {
      throw new NotFoundError('Board');
    }

    return { ...board, workspaceId: boardAccess.workspaceId };
  }

  async getProjectBoards(projectId: string, userId: string) {
    await resolveProjectAccess(projectId, userId);
    const boards = await this.boardRepository.findAllByProject(projectId);
    return boards.map((board) => ({ ...board, workspaceId: (board as any).project.workspaceId }));
  }

  async updateBoard(boardId: string, userId: string, data: UpdateBoardDto) {
    const boardAccess = await resolveBoardAccess(boardId, userId);

    if (!BoardPermissions.canManageBoard(boardAccess.permissionRole, userId, boardAccess.ownerId)) {
      throw new ForbiddenError('You do not have permission to update this board');
    }

    return this.boardRepository.update(boardId, data);
  }

  async deleteBoard(boardId: string, userId: string, permanent = false) {
    const boardAccess = await resolveBoardAccess(boardId, userId);

    if (!BoardPermissions.canManageBoard(boardAccess.permissionRole, userId, boardAccess.ownerId)) {
      throw new ForbiddenError('You do not have permission to delete this board');
    }

    if (permanent) {
      await this.boardRepository.hardDelete(boardId);
    } else {
      await this.boardRepository.softDelete(boardId);
    }
  }
}
