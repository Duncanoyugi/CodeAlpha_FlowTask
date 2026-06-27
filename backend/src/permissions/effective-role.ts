import { Role } from '../generated/prisma';

export type EffectiveRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export function computeEffectiveRole(
  membershipRole: Role,
  userId: string,
  ownerId: string,
): EffectiveRole {
  if (userId === ownerId) {
    return 'OWNER';
  }
  return membershipRole as EffectiveRole;
}

/** Maps effective role to the Prisma Role used by domain permission helpers. */
export function toPermissionRole(effectiveRole: EffectiveRole): Role {
  if (effectiveRole === 'OWNER') {
    return Role.ADMIN;
  }
  return effectiveRole as Role;
}
