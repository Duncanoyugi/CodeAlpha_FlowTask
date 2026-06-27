"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityService = void 0;
const activity_repository_1 = require("./activity.repository");
const prisma_1 = require("../../../src/lib/prisma");
const prisma_2 = require("../../generated/prisma");
const access_resolver_1 = require("../../../src/permissions/access-resolver");
const error_1 = require("../../../src/utils/error");
class ActivityService {
    activityRepository;
    constructor() {
        this.activityRepository = new activity_repository_1.ActivityRepository();
    }
    async logActivity(workspaceId, userId, entityType, entityId, action, details, projectId, taskId) {
        return this.activityRepository.create({
            workspaceId,
            userId,
            entityType,
            entityId,
            action,
            details,
            projectId,
            taskId,
        });
    }
    async logTaskCreated(workspaceId, userId, taskId, projectId) {
        return this.logActivity(workspaceId, userId, prisma_2.EntityType.TASK, taskId, prisma_2.Action.CREATED, { message: 'Task created' }, projectId, taskId);
    }
    async logTaskMoved(workspaceId, userId, taskId, projectId, fromColumn, toColumn) {
        return this.logActivity(workspaceId, userId, prisma_2.EntityType.TASK, taskId, prisma_2.Action.MOVED, { fromColumn, toColumn, message: `Task moved from ${fromColumn} to ${toColumn}` }, projectId, taskId);
    }
    async logTaskAssigned(workspaceId, userId, taskId, projectId, assigneeId) {
        const assignee = await prisma_1.prisma.user.findUnique({
            where: { id: assigneeId },
            select: { firstName: true, lastName: true },
        });
        return this.logActivity(workspaceId, userId, prisma_2.EntityType.TASK, taskId, prisma_2.Action.ASSIGNED, {
            assigneeId,
            assigneeName: assignee ? `${assignee.firstName} ${assignee.lastName}` : 'Unknown',
            message: `Task assigned to ${assignee?.firstName || 'user'}`,
        }, projectId, taskId);
    }
    async logTaskCompleted(workspaceId, userId, taskId, projectId) {
        return this.logActivity(workspaceId, userId, prisma_2.EntityType.TASK, taskId, prisma_2.Action.COMPLETED, { message: 'Task completed' }, projectId, taskId);
    }
    async logCommentAdded(workspaceId, userId, commentId, taskId, projectId) {
        return this.logActivity(workspaceId, userId, prisma_2.EntityType.COMMENT, commentId, prisma_2.Action.COMMENT_ADDED, { message: 'Comment added' }, projectId, taskId);
    }
    async logMemberInvited(workspaceId, userId, invitedEmail) {
        return this.logActivity(workspaceId, userId, prisma_2.EntityType.MEMBER, invitedEmail, prisma_2.Action.MEMBER_INVITED, { invitedEmail, message: `Invited ${invitedEmail} to workspace` });
    }
    async logMemberRemoved(workspaceId, userId, removedUserId) {
        const removedUser = await prisma_1.prisma.user.findUnique({
            where: { id: removedUserId },
            select: { email: true },
        });
        return this.logActivity(workspaceId, userId, prisma_2.EntityType.MEMBER, removedUserId, prisma_2.Action.MEMBER_REMOVED, {
            removedUserId,
            removedEmail: removedUser?.email,
            message: `Removed ${removedUser?.email || 'user'} from workspace`,
        });
    }
    async logRoleChanged(workspaceId, userId, targetUserId, oldRole, newRole) {
        const targetUser = await prisma_1.prisma.user.findUnique({
            where: { id: targetUserId },
            select: { email: true },
        });
        return this.logActivity(workspaceId, userId, prisma_2.EntityType.MEMBER, targetUserId, prisma_2.Action.ROLE_CHANGED, {
            targetUserId,
            targetEmail: targetUser?.email,
            oldRole,
            newRole,
            message: `Changed role of ${targetUser?.email || 'user'} from ${oldRole} to ${newRole}`,
        });
    }
    async getWorkspaceActivities(workspaceId, userId) {
        const access = await (0, access_resolver_1.resolveWorkspaceAccess)(workspaceId, userId);
        if (access.permissionRole === prisma_2.Role.VIEWER) {
            throw new error_1.ForbiddenError('You do not have permission to view activity logs');
        }
        return this.activityRepository.findAllByWorkspace(workspaceId);
    }
    async getTaskActivities(taskId, userId) {
        const task = await prisma_1.prisma.task.findUnique({
            where: { id: taskId },
            select: { boardId: true },
        });
        if (!task) {
            throw new error_1.NotFoundError('Task');
        }
        const board = await prisma_1.prisma.board.findUnique({
            where: { id: task.boardId },
            select: { projectId: true },
        });
        if (!board) {
            throw new error_1.NotFoundError('Board');
        }
        const access = await (0, access_resolver_1.resolveProjectAccess)(board.projectId, userId);
        if (access.permissionRole === prisma_2.Role.VIEWER) {
            throw new error_1.ForbiddenError('You do not have permission to view activity logs');
        }
        return this.activityRepository.findAllByTask(taskId);
    }
    async getProjectActivities(projectId, userId) {
        const access = await (0, access_resolver_1.resolveProjectAccess)(projectId, userId);
        if (access.permissionRole === prisma_2.Role.VIEWER) {
            throw new error_1.ForbiddenError('You do not have permission to view activity logs');
        }
        return this.activityRepository.findAllByProject(projectId);
    }
}
exports.ActivityService = ActivityService;
