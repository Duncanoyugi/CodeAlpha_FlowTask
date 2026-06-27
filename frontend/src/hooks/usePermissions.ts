import { useAppSelector } from '@store/hooks';
import { Role } from '@constants/roles';

export const usePermissions = () => {
  const { currentRole } = useAppSelector((state) => state.workspace);

  // If role isn't loaded yet, default to the lowest-privilege role.
  const role = currentRole ?? Role.VIEWER;

  const isOwnerOrAdmin = role === Role.OWNER || role === Role.ADMIN;

  return {
    canCreateWorkspace: isOwnerOrAdmin,
    canCreateProject: isOwnerOrAdmin,
    canCreateBoard: isOwnerOrAdmin,
    canCreateColumn: isOwnerOrAdmin,

    // Task creation is allowed for MEMBER but denied for VIEWER.
    canCreateTask: role !== Role.VIEWER,

    canManageMembers: isOwnerOrAdmin,
  };
};

