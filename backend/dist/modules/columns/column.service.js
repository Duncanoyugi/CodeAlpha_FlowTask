"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnService = void 0;
const column_repository_1 = require("./column.repository");
const error_1 = require("../../../src/utils/error");
const column_permissions_1 = require("../../../src/permissions/column.permissions");
const access_resolver_1 = require("../../../src/permissions/access-resolver");
class ColumnService {
    columnRepository;
    constructor() {
        this.columnRepository = new column_repository_1.ColumnRepository();
    }
    async createColumn(boardId, userId, data) {
        const workspaceAccess = await (0, access_resolver_1.resolveBoardAccess)(boardId, userId);
        if (!column_permissions_1.ColumnPermissions.canManageColumn(workspaceAccess.permissionRole, userId, workspaceAccess.ownerId)) {
            throw new error_1.ForbiddenError('You do not have permission to create columns');
        }
        const position = data.position || await this.columnRepository.getMaxPosition(boardId);
        return this.columnRepository.create({
            boardId,
            name: data.name,
            position,
        });
    }
    async getColumnById(columnId, userId) {
        const column = await this.columnRepository.findById(columnId);
        if (!column) {
            throw new error_1.NotFoundError('Column');
        }
        await (0, access_resolver_1.resolveBoardAccess)(column.boardId, userId);
        return column;
    }
    async getBoardColumns(boardId, userId) {
        await (0, access_resolver_1.resolveBoardAccess)(boardId, userId);
        return this.columnRepository.findAllByBoard(boardId);
    }
    async updateColumn(columnId, userId, data) {
        const column = await this.columnRepository.findById(columnId);
        if (!column) {
            throw new error_1.NotFoundError('Column');
        }
        const workspaceAccess = await (0, access_resolver_1.resolveBoardAccess)(column.boardId, userId);
        if (!column_permissions_1.ColumnPermissions.canManageColumn(workspaceAccess.permissionRole, userId, workspaceAccess.ownerId)) {
            throw new error_1.ForbiddenError('You do not have permission to update this column');
        }
        return this.columnRepository.update(columnId, data);
    }
    async deleteColumn(columnId, userId) {
        const column = await this.columnRepository.findById(columnId);
        if (!column) {
            throw new error_1.NotFoundError('Column');
        }
        const workspaceAccess = await (0, access_resolver_1.resolveBoardAccess)(column.boardId, userId);
        if (!column_permissions_1.ColumnPermissions.canManageColumn(workspaceAccess.permissionRole, userId, workspaceAccess.ownerId)) {
            throw new error_1.ForbiddenError('You do not have permission to delete this column');
        }
        await this.columnRepository.delete(columnId);
    }
    async reorderColumns(boardId, userId, data) {
        const workspaceAccess = await (0, access_resolver_1.resolveBoardAccess)(boardId, userId);
        if (!column_permissions_1.ColumnPermissions.canManageColumn(workspaceAccess.permissionRole, userId, workspaceAccess.ownerId)) {
            throw new error_1.ForbiddenError('You do not have permission to reorder columns');
        }
        await this.columnRepository.reorderColumns(data.columnIds);
    }
}
exports.ColumnService = ColumnService;
