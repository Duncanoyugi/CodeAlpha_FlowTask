"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeEffectiveRole = computeEffectiveRole;
exports.toPermissionRole = toPermissionRole;
const prisma_1 = require("../generated/prisma");
function computeEffectiveRole(membershipRole, userId, ownerId) {
    if (userId === ownerId) {
        return 'OWNER';
    }
    return membershipRole;
}
/** Maps effective role to the Prisma Role used by domain permission helpers. */
function toPermissionRole(effectiveRole) {
    if (effectiveRole === 'OWNER') {
        return prisma_1.Role.ADMIN;
    }
    return effectiveRole;
}
