"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoardService = void 0;
const board_repository_1 = require("./board.repository");
const error_1 = require("../../../src/utils/error");
const prisma_1 = require("../../../src/lib/prisma");
const prisma_2 = require("../../generated/prisma");
class BoardService {
    boardRepository;
    constructor() {
        this.boardRepository = new board_repository_1.BoardRepository();
    }
    async checkProjectAccess(projectId, userId) {
        const project = await prisma_1.prisma.project.findUnique({
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
            throw new error_1.NotFoundError('Project');
        }
        const member = project.workspace.members[0];
        if (!member) {
            throw new error_1.ForbiddenError('You do not have access to this project');
        }
        return member.role;
    }
    async createBoard(projectId, userId, data) {
        await this.checkProjectAccess(projectId, userId);
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
        return board;
    }
    async getProjectBoards(projectId, userId) {
        await this.checkProjectAccess(projectId, userId);
        return this.boardRepository.findAllByProject(projectId);
    }
    async updateBoard(boardId, userId, data) {
        const board = await this.boardRepository.findById(boardId);
        if (!board) {
            throw new error_1.NotFoundError('Board');
        }
        const userRole = await this.checkProjectAccess(board.projectId, userId);
        // Only ADMIN can update boards
        if (userRole !== prisma_2.Role.ADMIN) {
            throw new error_1.ForbiddenError('You do not have permission to update this board');
        }
        return this.boardRepository.update(boardId, data);
    }
    async deleteBoard(boardId, userId, permanent = false) {
        const board = await this.boardRepository.findById(boardId);
        if (!board) {
            throw new error_1.NotFoundError('Board');
        }
        const userRole = await this.checkProjectAccess(board.projectId, userId);
        // Only ADMIN can delete boards
        if (userRole !== prisma_2.Role.ADMIN) {
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
