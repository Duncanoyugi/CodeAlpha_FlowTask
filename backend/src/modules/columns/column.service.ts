import { ColumnRepository } from './column.repository';
import { CreateColumnDto, UpdateColumnDto, ReorderColumnsDto } from './column.dto';
import { NotFoundError, ForbiddenError } from '../../../src/utils/error';
import { ColumnPermissions } from '../../../src/permissions/column.permissions';
import { resolveBoardAccess } from '../../../src/permissions/access-resolver';

export class ColumnService {
  private columnRepository: ColumnRepository;

  constructor() {
    this.columnRepository = new ColumnRepository();
  }

  async createColumn(boardId: string, userId: string, data: CreateColumnDto) {
    const workspaceAccess = await resolveBoardAccess(boardId, userId);

    if (!ColumnPermissions.canManageColumn(workspaceAccess.permissionRole, userId, workspaceAccess.ownerId)) {
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

    await resolveBoardAccess(column.boardId, userId);

    return column;
  }

  async getBoardColumns(boardId: string, userId: string) {
    await resolveBoardAccess(boardId, userId);
    return this.columnRepository.findAllByBoard(boardId);
  }

  async updateColumn(columnId: string, userId: string, data: UpdateColumnDto) {
    const column = await this.columnRepository.findById(columnId);
    if (!column) {
      throw new NotFoundError('Column');
    }

    const workspaceAccess = await resolveBoardAccess(column.boardId, userId);

    if (!ColumnPermissions.canManageColumn(workspaceAccess.permissionRole, userId, workspaceAccess.ownerId)) {
      throw new ForbiddenError('You do not have permission to update this column');
    }

    return this.columnRepository.update(columnId, data);
  }

  async deleteColumn(columnId: string, userId: string) {
    const column = await this.columnRepository.findById(columnId);
    if (!column) {
      throw new NotFoundError('Column');
    }

    const workspaceAccess = await resolveBoardAccess(column.boardId, userId);

    if (!ColumnPermissions.canManageColumn(workspaceAccess.permissionRole, userId, workspaceAccess.ownerId)) {
      throw new ForbiddenError('You do not have permission to delete this column');
    }

    await this.columnRepository.delete(columnId);
  }

  async reorderColumns(boardId: string, userId: string, data: ReorderColumnsDto) {
    const workspaceAccess = await resolveBoardAccess(boardId, userId);

    if (!ColumnPermissions.canManageColumn(workspaceAccess.permissionRole, userId, workspaceAccess.ownerId)) {
      throw new ForbiddenError('You do not have permission to reorder columns');
    }

    await this.columnRepository.reorderColumns(data.columnIds);
  }
}
