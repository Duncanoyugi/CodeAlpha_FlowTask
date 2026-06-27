"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPermissionRole = exports.computeEffectiveRole = void 0;
exports.resolveWorkspaceAccess = resolveWorkspaceAccess;
exports.resolveProjectAccess = resolveProjectAccess;
exports.resolveBoardAccess = resolveBoardAccess;
exports.resolveTaskAccess = resolveTaskAccess;
exports.resolveAccessibleProjectIds = resolveAccessibleProjectIds;
exports.assertProjectAccess = assertProjectAccess;
const prisma_1 = require("../lib/prisma");
const error_1 = require("../utils/error");
const effective_role_1 = require("./effective-role");
Object.defineProperty(exports, "computeEffectiveRole", { enumerable: true, get: function () { return effective_role_1.computeEffectiveRole; } });
Object.defineProperty(exports, "toPermissionRole", { enumerable: true, get: function () { return effective_role_1.toPermissionRole; } });
async function loadWorkspaceMembership(workspaceId, userId) {
    const [member, workspace] = await Promise.all([
        prisma_1.prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId,
                },
            },
            select: { role: true },
        }),
        prisma_1.prisma.workspace.findUnique({
            where: { id: workspaceId },
            select: { ownerId: true },
        }),
    ]);
    if (!workspace) {
        throw new error_1.NotFoundError('Workspace');
    }
    if (!member) {
        throw new error_1.ForbiddenError('You do not have access to this workspace');
    }
    return { membershipRole: member.role, ownerId: workspace.ownerId };
}
function buildWorkspaceAccess(userId, workspaceId, membershipRole, ownerId) {
    const effectiveRole = (0, effective_role_1.computeEffectiveRole)(membershipRole, userId, ownerId);
    return {
        userId,
        workspaceId,
        ownerId,
        membershipRole,
        effectiveRole,
        permissionRole: (0, effective_role_1.toPermissionRole)(effectiveRole),
    };
}
async function assertProjectMembership(projectId, userId) {
    const projectMembers = await prisma_1.prisma.projectMember.findMany({
        where: { projectId },
        select: { userId: true },
    });
    if (projectMembers.length > 0 &&
        !projectMembers.some((member) => member.userId === userId)) {
        throw new error_1.ForbiddenError('You do not have access to this project');
    }
}
async function resolveWorkspaceAccess(workspaceId, userId) {
    const { membershipRole, ownerId } = await loadWorkspaceMembership(workspaceId, userId);
    return buildWorkspaceAccess(userId, workspaceId, membershipRole, ownerId);
}
async function resolveProjectAccess(projectId, userId) {
    const project = await prisma_1.prisma.project.findUnique({
        where: { id: projectId },
        select: { workspaceId: true },
    });
    if (!project) {
        throw new error_1.NotFoundError('Project');
    }
    const { membershipRole, ownerId } = await loadWorkspaceMembership(project.workspaceId, userId);
    const workspaceAccess = buildWorkspaceAccess(userId, project.workspaceId, membershipRole, ownerId);
    // Owners and Admins bypass project membership requirements
    if (workspaceAccess.effectiveRole !== 'OWNER' && workspaceAccess.effectiveRole !== 'ADMIN') {
        await assertProjectMembership(projectId, userId);
    }
    return {
        ...workspaceAccess,
        projectId,
    };
}
async function resolveBoardAccess(boardId, userId) {
    const board = await prisma_1.prisma.board.findUnique({
        where: { id: boardId },
        select: { id: true, projectId: true },
    });
    if (!board) {
        throw new error_1.NotFoundError('Board');
    }
    const projectAccess = await resolveProjectAccess(board.projectId, userId);
    return {
        ...projectAccess,
        boardId: board.id,
    };
}
async function resolveTaskAccess(taskId, userId) {
    const task = await prisma_1.prisma.task.findUnique({
        where: { id: taskId },
        select: {
            id: true,
            boardId: true,
            reporterId: true,
            assigneeId: true,
        },
    });
    if (!task) {
        throw new error_1.NotFoundError('Task');
    }
    const boardAccess = await resolveBoardAccess(task.boardId, userId);
    return {
        ...boardAccess,
        taskId: task.id,
        reporterId: task.reporterId,
        assigneeId: task.assigneeId,
    };
}
/** Returns project IDs the user may access within a workspace (single query set, no N+1). */
async function resolveAccessibleProjectIds(workspaceId, userId) {
    const workspaceAccess = await resolveWorkspaceAccess(workspaceId, userId);
    const projects = await prisma_1.prisma.project.findMany({
        where: { workspaceId, deletedAt: null },
        select: { id: true },
    });
    if (projects.length === 0) {
        return [];
    }
    const projectIds = projects.map((project) => project.id);
    // Workspace Owners and Admins have access to all projects in the workspace
    if (workspaceAccess.effectiveRole === 'OWNER' || workspaceAccess.effectiveRole === 'ADMIN') {
        return projectIds;
    }
    const restrictedProjectIds = await prisma_1.prisma.projectMember.groupBy({
        by: ['projectId'],
        where: { projectId: { in: projectIds } },
    });
    if (restrictedProjectIds.length === 0) {
        return projectIds;
    }
    const restrictedIds = new Set(restrictedProjectIds.map((entry) => entry.projectId));
    const userMemberships = await prisma_1.prisma.projectMember.findMany({
        where: {
            userId,
            projectId: { in: [...restrictedIds] },
        },
        select: { projectId: true },
    });
    const accessibleRestrictedIds = new Set(userMemberships.map((membership) => membership.projectId));
    return projectIds.filter((id) => !restrictedIds.has(id) || accessibleRestrictedIds.has(id));
}
/** @deprecated Use resolveProjectAccess — kept for incremental migration. */
async function assertProjectAccess(projectId, userId) {
    const access = await resolveProjectAccess(projectId, userId);
    return {
        role: access.permissionRole,
        ownerId: access.ownerId,
        workspaceId: access.workspaceId,
        effectiveRole: access.effectiveRole,
    };
}
