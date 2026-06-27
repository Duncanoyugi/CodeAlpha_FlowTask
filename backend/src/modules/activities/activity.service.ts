import { ActivityRepository } from './activity.repository';
import { prisma } from '../../../src/lib/prisma';
import { EntityType, Action, Role } from '../../generated/prisma';
import {
  resolveProjectAccess,
  resolveWorkspaceAccess,
} from '../../../src/permissions/access-resolver';
import { ForbiddenError, NotFoundError } from '../../../src/utils/error';

export class ActivityService {
  private activityRepository: ActivityRepository;

  constructor() {
    this.activityRepository = new ActivityRepository();
  }

  async logActivity(
    workspaceId: string,
    userId: string,
    entityType: EntityType,
    entityId: string,
    action: Action,
    details?: any,
    projectId?: string,
    taskId?: string,
  ) {
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

  async logTaskCreated(workspaceId: string, userId: string, taskId: string, projectId: string) {
    return this.logActivity(
      workspaceId,
      userId,
      EntityType.TASK,
      taskId,
      Action.CREATED,
      { message: 'Task created' },
      projectId,
      taskId,
    );
  }

  async logTaskMoved(
    workspaceId: string,
    userId: string,
    taskId: string,
    projectId: string,
    fromColumn: string,
    toColumn: string,
  ) {
    return this.logActivity(
      workspaceId,
      userId,
      EntityType.TASK,
      taskId,
      Action.MOVED,
      { fromColumn, toColumn, message: `Task moved from ${fromColumn} to ${toColumn}` },
      projectId,
      taskId,
    );
  }

  async logTaskAssigned(
    workspaceId: string,
    userId: string,
    taskId: string,
    projectId: string,
    assigneeId: string,
  ) {
    const assignee = await prisma.user.findUnique({
      where: { id: assigneeId },
      select: { firstName: true, lastName: true },
    });

    return this.logActivity(
      workspaceId,
      userId,
      EntityType.TASK,
      taskId,
      Action.ASSIGNED,
      {
        assigneeId,
        assigneeName: assignee ? `${assignee.firstName} ${assignee.lastName}` : 'Unknown',
        message: `Task assigned to ${assignee?.firstName || 'user'}`,
      },
      projectId,
      taskId,
    );
  }

  async logTaskCompleted(
    workspaceId: string,
    userId: string,
    taskId: string,
    projectId: string,
  ) {
    return this.logActivity(
      workspaceId,
      userId,
      EntityType.TASK,
      taskId,
      Action.COMPLETED,
      { message: 'Task completed' },
      projectId,
      taskId,
    );
  }

  async logCommentAdded(
    workspaceId: string,
    userId: string,
    commentId: string,
    taskId: string,
    projectId: string,
  ) {
    return this.logActivity(
      workspaceId,
      userId,
      EntityType.COMMENT,
      commentId,
      Action.COMMENT_ADDED,
      { message: 'Comment added' },
      projectId,
      taskId,
    );
  }

  async logMemberInvited(
    workspaceId: string,
    userId: string,
    invitedEmail: string,
  ) {
    return this.logActivity(
      workspaceId,
      userId,
      EntityType.MEMBER,
      invitedEmail,
      Action.MEMBER_INVITED,
      { invitedEmail, message: `Invited ${invitedEmail} to workspace` },
    );
  }

  async logMemberRemoved(
    workspaceId: string,
    userId: string,
    removedUserId: string,
  ) {
    const removedUser = await prisma.user.findUnique({
      where: { id: removedUserId },
      select: { email: true },
    });

    return this.logActivity(
      workspaceId,
      userId,
      EntityType.MEMBER,
      removedUserId,
      Action.MEMBER_REMOVED,
      {
        removedUserId,
        removedEmail: removedUser?.email,
        message: `Removed ${removedUser?.email || 'user'} from workspace`,
      },
    );
  }

  async logRoleChanged(
    workspaceId: string,
    userId: string,
    targetUserId: string,
    oldRole: string,
    newRole: string,
  ) {
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { email: true },
    });

    return this.logActivity(
      workspaceId,
      userId,
      EntityType.MEMBER,
      targetUserId,
      Action.ROLE_CHANGED,
      {
        targetUserId,
        targetEmail: targetUser?.email,
        oldRole,
        newRole,
        message: `Changed role of ${targetUser?.email || 'user'} from ${oldRole} to ${newRole}`,
      },
    );
  }

  async getWorkspaceActivities(workspaceId: string, userId: string) {
    const access = await resolveWorkspaceAccess(workspaceId, userId);

    if (access.permissionRole === Role.VIEWER) {
      throw new ForbiddenError('You do not have permission to view activity logs');
    }

    return this.activityRepository.findAllByWorkspace(workspaceId);
  }

  async getTaskActivities(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { boardId: true },
    });

    if (!task) {
      throw new NotFoundError('Task');
    }

    const board = await prisma.board.findUnique({
      where: { id: task.boardId },
      select: { projectId: true },
    });

    if (!board) {
      throw new NotFoundError('Board');
    }

    const access = await resolveProjectAccess(board.projectId, userId);

    if (access.permissionRole === Role.VIEWER) {
      throw new ForbiddenError('You do not have permission to view activity logs');
    }

    return this.activityRepository.findAllByTask(taskId);
  }

  async getProjectActivities(projectId: string, userId: string) {
    const access = await resolveProjectAccess(projectId, userId);

    if (access.permissionRole === Role.VIEWER) {
      throw new ForbiddenError('You do not have permission to view activity logs');
    }

    return this.activityRepository.findAllByProject(projectId);
  }
}
