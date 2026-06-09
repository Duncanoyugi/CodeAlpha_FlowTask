import { BoardRepository } from './board.repository';
import { CreateBoardDto, UpdateBoardDto } from './board.dto';
import { NotFoundError, ForbiddenError } from '../../../src/utils/error';
import { prisma } from '../../../src/lib/prisma';
import { Role } from '../../generated/prisma';

export class BoardService {
  private boardRepository: BoardRepository;

  constructor() {
    this.boardRepository = new BoardRepository();
  }

  private async checkProjectAccess(projectId: string, userId: string): Promise<Role> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        workspace: {
          include: {
            members: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundError('Project');
    }

    const member = project.workspace.members[0];
    if (!member) {
      throw new ForbiddenError('You do not have access to this project');
    }

    return member.role;
  }

  async createBoard(projectId: string, userId: string, data: CreateBoardDto) {
    await this.checkProjectAccess(projectId, userId);
    
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
    
    return board;
  }

  async getProjectBoards(projectId: string, userId: string) {
    await this.checkProjectAccess(projectId, userId);
    return this.boardRepository.findAllByProject(projectId);
  }

  async updateBoard(boardId: string, userId: string, data: UpdateBoardDto) {
    const board = await this.boardRepository.findById(boardId);
    if (!board) {
      throw new NotFoundError('Board');
    }

    const userRole = await this.checkProjectAccess(board.projectId, userId);
    
    // Only ADMIN can update boards
    if (userRole !== Role.ADMIN) {
      throw new ForbiddenError('You do not have permission to update this board');
    }

    return this.boardRepository.update(boardId, data);
  }

  async deleteBoard(boardId: string, userId: string, permanent = false) {
    const board = await this.boardRepository.findById(boardId);
    if (!board) {
      throw new NotFoundError('Board');
    }

    const userRole = await this.checkProjectAccess(board.projectId, userId);
    
    // Only ADMIN can delete boards
    if (userRole !== Role.ADMIN) {
      throw new ForbiddenError('You do not have permission to delete this board');
    }

    if (permanent) {
      await this.boardRepository.hardDelete(boardId);
    } else {
      await this.boardRepository.softDelete(boardId);
    }
  }
}