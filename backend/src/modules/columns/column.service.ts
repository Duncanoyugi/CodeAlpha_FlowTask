import { ColumnRepository } from './column.repository';
import { CreateColumnDto, UpdateColumnDto, ReorderColumnsDto } from './column.dto';
import { NotFoundError, ForbiddenError } from '../../../src/utils/error';
import { prisma } from '../../../src/lib/prisma';
import { Role } from '../../generated/prisma';
import { ColumnPermissions } from '../../../src/permissions/column.permissions';
import { assertProjectAccess } from '../../../src/permissions/project-access.permissions';

export class ColumnService {
  private columnRepository: ColumnRepository;

  constructor() {
    this.columnRepository = new ColumnRepository();
  }

  private async checkBoardAccess(boardId: string, userId: string): Promise<{ role: Role; ownerId: string }> {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      select: { projectId: true },
    });

    if (!board) {
      throw new NotFoundError('Board');
    }

    return assertProjectAccess(board.projectId, userId);
  }

  async createColumn(boardId: string, userId: string, data: CreateColumnDto) {
    const workspaceAccess = await this.checkBoardAccess(boardId, userId);
    
    if (!ColumnPermissions.canManageColumn(workspaceAccess.role, userId, workspaceAccess.ownerId)) {
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

    const workspaceAccess = await this.checkBoardAccess(column.boardId, userId);
    
    if (!ColumnPermissions.canManageColumn(workspaceAccess.role, userId, workspaceAccess.ownerId)) {
      throw new ForbiddenError('You do not have permission to update this column');
    }

    return this.columnRepository.update(columnId, data);
  }

  async deleteColumn(columnId: string, userId: string) {
    const column = await this.columnRepository.findById(columnId);
    if (!column) {
      throw new NotFoundError('Column');
    }

    const workspaceAccess = await this.checkBoardAccess(column.boardId, userId);
    
    if (!ColumnPermissions.canManageColumn(workspaceAccess.role, userId, workspaceAccess.ownerId)) {
      throw new ForbiddenError('You do not have permission to delete this column');
    }

    await this.columnRepository.delete(columnId);
  }

  async reorderColumns(boardId: string, userId: string, data: ReorderColumnsDto) {
    const workspaceAccess = await this.checkBoardAccess(boardId, userId);
    
    if (!ColumnPermissions.canManageColumn(workspaceAccess.role, userId, workspaceAccess.ownerId)) {
      throw new ForbiddenError('You do not have permission to reorder columns');
    }

    await this.columnRepository.reorderColumns(data.columnIds);
  }
}