"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoardService = void 0;
const board_repository_1 = require("./board.repository");
const error_1 = require("../../../src/utils/error");
const board_permissions_1 = require("../../../src/permissions/board.permissions");
const project_access_permissions_1 = require("../../../src/permissions/project-access.permissions");
class BoardService {
    boardRepository;
    constructor() {
        this.boardRepository = new board_repository_1.BoardRepository();
    }
    async checkProjectAccess(projectId, userId) {
        return (0, project_access_permissions_1.assertProjectAccess)(projectId, userId);
    }
    async createBoard(projectId, userId, data) {
        const workspaceAccess = await this.checkProjectAccess(projectId, userId);
        if (!board_permissions_1.BoardPermissions.canManageBoard(workspaceAccess.role, userId, workspaceAccess.ownerId)) {
            throw new error_1.ForbiddenError('You do not have permission to create boards');
        }
        return this.boardRepository.create({
            projectId,
            name: data.name,
        });
    }
    async getBoardById(boardId, userId) {
        const board = await this.boardRepository.findById(boardId);
        if (!board) {
            throw new error_1.NotFoundError('Board');
        }
        await this.checkProjectAccess(board.projectId, userId);
        return { ...board, workspaceId: board.project.workspaceId };
    }
    async getProjectBoards(projectId, userId) {
        await this.checkProjectAccess(projectId, userId);
        const boards = await this.boardRepository.findAllByProject(projectId);
        return boards.map((board) => ({ ...board, workspaceId: board.project.workspaceId }));
    }
    async updateBoard(boardId, userId, data) {
        const board = await this.boardRepository.findById(boardId);
        if (!board) {
            throw new error_1.NotFoundError('Board');
        }
        const workspaceAccess = await this.checkProjectAccess(board.projectId, userId);
        if (!board_permissions_1.BoardPermissions.canManageBoard(workspaceAccess.role, userId, workspaceAccess.ownerId)) {
            throw new error_1.ForbiddenError('You do not have permission to update this board');
        }
        return this.boardRepository.update(boardId, data);
    }
    async deleteBoard(boardId, userId, permanent = false) {
        const board = await this.boardRepository.findById(boardId);
        if (!board) {
            throw new error_1.NotFoundError('Board');
        }
        const workspaceAccess = await this.checkProjectAccess(board.projectId, userId);
        if (!board_permissions_1.BoardPermissions.canManageBoard(workspaceAccess.role, userId, workspaceAccess.ownerId)) {
            throw new error_1.ForbiddenError('You do not have permission to delete this board');
        }
        if (permanent) {
            await this.boardRepository.hardDelete(boardId);
        }
        else {
            await this.boardRepository.softDelete(boardId);
        }
    }
}
exports.BoardService = BoardService;
