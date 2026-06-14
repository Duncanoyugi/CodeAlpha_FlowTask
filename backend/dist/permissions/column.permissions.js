"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnPermissions = void 0;
const roles_1 = require("../constants/roles");
class ColumnPermissions {
    static canManageColumn(userRole, userId, workspaceOwnerId) {
        return (0, roles_1.canManageWorkspaceResources)(userRole, userId, workspaceOwnerId);
    }
}
exports.ColumnPermissions = ColumnPermissions;
