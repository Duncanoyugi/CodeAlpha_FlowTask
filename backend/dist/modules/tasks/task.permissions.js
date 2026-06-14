"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskPermissions = void 0;
const prisma_1 = require("../../generated/prisma");
class TaskPermissions {
    static canCreateTask(userRole) {
        return userRole === prisma_1.Role.ADMIN || userRole === prisma_1.Role.MEMBER;
    }
    static canUpdateTask(userRole, taskReporterId, taskAssigneeId, currentUserId) {
        // ADMIN can update any task
        if (userRole === prisma_1.Role.ADMIN)
            return true;
        // MEMBER can update tasks they reported or are assigned to
        if (userRole === prisma_1.Role.MEMBER) {
            return taskReporterId === currentUserId || taskAssigneeId === currentUserId;
        }
        // VIEWER cannot update
        return false;
    }
    static canDeleteTask(userRole, taskReporterId, currentUserId) {
        // ADMIN can delete any task
        if (userRole === prisma_1.Role.ADMIN)
            return true;
        // MEMBER can delete tasks they reported
        if (userRole === prisma_1.Role.MEMBER) {
            return taskReporterId === currentUserId;
        }
        // VIEWER cannot delete
        return false;
    }
    static canMoveTask(userRole, taskReporterId, taskAssigneeId, currentUserId) {
        // Same as update permission for MVP
        return this.canUpdateTask(userRole, taskReporterId, taskAssigneeId, currentUserId);
    }
    static canReorderTasks(userRole, tasks, currentUserId) {
        if (userRole === prisma_1.Role.ADMIN)
            return true;
        if (userRole !== prisma_1.Role.MEMBER) {
            return false;
        }
        return tasks.every((task) => task.reporterId === currentUserId || task.assigneeId === currentUserId);
    }
}
exports.TaskPermissions = TaskPermissions;
