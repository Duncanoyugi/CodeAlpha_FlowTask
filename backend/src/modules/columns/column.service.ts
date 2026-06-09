import { ColumnRepository } from './column.repository';
import { CreateColumnDto, UpdateColumnDto, ReorderColumnsDto } from './column.dto';
import { NotFoundError, ForbiddenError } from '../../../src/utils/error';
import { prisma } from '../../../src/lib/prisma';
import { Role } from '../../generated/prisma';

export class ColumnService {
  private columnRepository: ColumnRepository;

  constructor() {
    this.columnRepository = new ColumnRepository();
  }

  private async checkBoardAccess(boardId: string, userId: string): Promise<Role> {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        project: {
          include: {
            workspace: {
              include: {
                members: {
                  where: { userId },
                },
              },
            },
          },
        },
      },
    });

    if (!board) {
      throw new NotFoundError('Board');
    }

    const member = board.project.workspace.members[0];
    if (!member) {
      throw new ForbiddenError('You do not have access to this board');
    }

    return member.role;
  }

  async createColumn(boardId: string, userId: string, data: CreateColumnDto) {
    const userRole = await this.checkBoardAccess(boardId, userId);
    
    // Only ADMIN and MEMBER can create columns (but typically ADMIN only)
    if (userRole !== Role.ADMIN) {
      throw new ForbiddenError('You do not have permission to create columns');
    }

    const position = data.position || await this.columnRepository.getMaxPosition(boardId);

    return this.columnRepository.create({
      boardId,
      name: data.name,
      position,
    });
  }

  async getColumnById(columnId: string, userId: string) {
    const column = await this.columnRepository.findById(columnId);
    if (!column) {
      throw new NotFoundError('Column');
    }

    await this.checkBoardAccess(column.boardId, userId);
    
    return column;
  }

  async getBoardColumns(boardId: string, userId: string) {
    await this.checkBoardAccess(boardId, userId);
    return this.columnRepository.findAllByBoard(boardId);
  }

  async updateColumn(columnId: string, userId: string, data: UpdateColumnDto) {
    const column = await this.columnRepository.findById(columnId);
    if (!column) {
      throw new NotFoundError('Column');
    }

    const userRole = await this.checkBoardAccess(column.boardId, userId);
    
    if (userRole !== Role.ADMIN) {
      throw new ForbiddenError('You do not have permission to update this column');
    }

    return this.columnRepository.update(columnId, data);
  }

  async deleteColumn(columnId: string, userId: string) {
    const column = await this.columnRepository.findById(columnId);
    if (!column) {
      throw new NotFoundError('Column');
    }

    const userRole = await this.checkBoardAccess(column.boardId, userId);
    
    if (userRole !== Role.ADMIN) {
      throw new ForbiddenError('You do not have permission to delete this column');
    }

    await this.columnRepository.delete(columnId);
  }

  async reorderColumns(boardId: string, userId: string, data: ReorderColumnsDto) {
    const userRole = await this.checkBoardAccess(boardId, userId);
    
    if (userRole !== Role.ADMIN) {
      throw new ForbiddenError('You do not have permission to reorder columns');
    }

    await this.columnRepository.reorderColumns(data.columnIds);
  }
}