import { BoardRepository } from './board.repository';
import { CreateBoardDto, UpdateBoardDto } from './board.dto';
import { NotFoundError, ForbiddenError } from '../../../src/utils/error';
import { prisma } from '../../../src/lib/prisma';
import { Role } from '../../generated/prisma';
import { BoardPermissions } from '../../../src/permissions/board.permissions';
import { assertProjectAccess } from '../../../src/permissions/project-access.permissions';

export class BoardService {
  private boardRepository: BoardRepository;

  constructor() {
    this.boardRepository = new BoardRepository();
  }

  private async checkProjectAccess(projectId: string, userId: string): Promise<{ role: Role; ownerId: string }> {
    return assertProjectAccess(projectId, userId);
  }

  async createBoard(projectId: string, userId: string, data: CreateBoardDto) {
    const workspaceAccess = await this.checkProjectAccess(projectId, userId);
    if (!BoardPermissions.canManageBoard(workspaceAccess.role, userId, workspaceAccess.ownerId)) {
      throw new ForbiddenError('You do not have permission to create boards');
    }
    
    return this.boardRepository.create({
      projectId,
      name: data.name,
    });
  }

  async getBoardById(boardId: string, userId: string) {
    const board = await this.boardRepository.findById(boardId);
    if (!board) {
      throw new NotFoundError('Board');
    }

    await this.checkProjectAccess(board.projectId, userId);
    
    return { ...board, workspaceId: (board as any).project.workspaceId };
  }

  async getProjectBoards(projectId: string, userId: string) {
    await this.checkProjectAccess(projectId, userId);
    const boards = await this.boardRepository.findAllByProject(projectId);
    return boards.map((board) => ({ ...board, workspaceId: (board as any).project.workspaceId }));
  }

  async updateBoard(boardId: string, userId: string, data: UpdateBoardDto) {
    const board = await this.boardRepository.findById(boardId);
    if (!board) {
      throw new NotFoundError('Board');
    }

    const workspaceAccess = await this.checkProjectAccess(board.projectId, userId);
    
    if (!BoardPermissions.canManageBoard(workspaceAccess.role, userId, workspaceAccess.ownerId)) {
      throw new ForbiddenError('You do not have permission to update this board');
    }

    return this.boardRepository.update(boardId, data);
  }

  async deleteBoard(boardId: string, userId: string, permanent = false) {
    const board = await this.boardRepository.findById(boardId);
    if (!board) {
      throw new NotFoundError('Board');
    }

    const workspaceAccess = await this.checkProjectAccess(board.projectId, userId);
    
    if (!BoardPermissions.canManageBoard(workspaceAccess.role, userId, workspaceAccess.ownerId)) {
      throw new ForbiddenError('You do not have permission to delete this board');
    }

    if (permanent) {
      await this.boardRepository.hardDelete(boardId);
    } else {
      await this.boardRepository.softDelete(boardId);
    }
  }
}