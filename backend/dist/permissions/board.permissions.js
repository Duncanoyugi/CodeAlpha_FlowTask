"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoardPermissions = void 0;
const roles_1 = require("../constants/roles");
class BoardPermissions {
    static canManageBoard(userRole, userId, workspaceOwnerId) {
        return (0, roles_1.canManageWorkspaceResources)(userRole, userId, workspaceOwnerId);
    }
}
exports.BoardPermissions = BoardPermissions;
