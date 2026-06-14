"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertProjectAccess = assertProjectAccess;
const prisma_1 = require("../lib/prisma");
const error_1 = require("../utils/error");
async function assertProjectAccess(projectId, userId) {
    const project = await prisma_1.prisma.project.findUnique({
        where: { id: projectId },
        select: { workspaceId: true },
    });
    if (!project) {
        throw new error_1.NotFoundError('Project');
    }
    const workspaceMember = await prisma_1.prisma.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId: project.workspaceId,
                userId,
            },
        },
    });
    if (!workspaceMember) {
        throw new error_1.ForbiddenError('You do not have access to this workspace');
    }
    const projectMembers = await prisma_1.prisma.projectMember.findMany({
        where: { projectId },
        select: { userId: true },
    });
    if (projectMembers.length > 0 && !projectMembers.some((member) => member.userId === userId)) {
        throw new error_1.ForbiddenError('You do not have access to this project');
    }
    const workspace = await prisma_1.prisma.workspace.findUnique({
        where: { id: project.workspaceId },
        select: { ownerId: true },
    });
    if (!workspace) {
        throw new error_1.NotFoundError('Workspace');
    }
    return {
        role: workspaceMember.role,
        ownerId: workspace.ownerId,
        workspaceId: project.workspaceId,
    };
}
