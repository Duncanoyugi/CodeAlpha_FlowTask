"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectPermissions = void 0;
const roles_1 = require("../constants/roles");
class ProjectPermissions {
    static canManageProject(userRole, userId, workspaceOwnerId) {
        return (0, roles_1.canManageWorkspaceResources)(userRole, userId, workspaceOwnerId);
    }
}
exports.ProjectPermissions = ProjectPermissions;
