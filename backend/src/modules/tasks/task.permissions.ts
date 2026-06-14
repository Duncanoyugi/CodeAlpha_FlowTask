import { Role } from '../../generated/prisma';

export class TaskPermissions {
  static canCreateTask(userRole: Role): boolean {
    return userRole === Role.ADMIN || userRole === Role.MEMBER;
  }

  static canUpdateTask(
    userRole: Role,
    taskReporterId: string,
    taskAssigneeId: string | null,
    currentUserId: string,
  ): boolean {
    // ADMIN can update any task
    if (userRole === Role.ADMIN) return true;
    
    // MEMBER can update tasks they reported or are assigned to
    if (userRole === Role.MEMBER) {
      return taskReporterId === currentUserId || taskAssigneeId === currentUserId;
    }
    
    // VIEWER cannot update
    return false;
  }

  static canDeleteTask(userRole: Role, taskReporterId: string, currentUserId: string): boolean {
    // ADMIN can delete any task
    if (userRole === Role.ADMIN) return true;
    
    // MEMBER can delete tasks they reported
    if (userRole === Role.MEMBER) {
      return taskReporterId === currentUserId;
    }
    
    // VIEWER cannot delete
    return false;
  }

  static canMoveTask(
    userRole: Role,
    taskReporterId: string,
    taskAssigneeId: string | null,
    currentUserId: string,
  ): boolean {
    // Same as update permission for MVP
    return this.canUpdateTask(userRole, taskReporterId, taskAssigneeId, currentUserId);
  }

  static canReorderTasks(
    userRole: Role,
    tasks: Array<{ reporterId: string; assigneeId: string | null }>,
    currentUserId: string,
  ): boolean {
    if (userRole === Role.ADMIN) return true;

    if (userRole !== Role.MEMBER) {
      return false;
    }

    return tasks.every((task) => task.reporterId === currentUserId || task.assigneeId === currentUserId);
  }
}