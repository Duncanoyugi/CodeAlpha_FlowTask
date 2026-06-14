export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_OTP: '/verify-otp',
  
  // Dashboard
  DASHBOARD: '/dashboard',
  
  // Workspace
  WORKSPACES: '/workspaces',
  WORKSPACE_DETAIL: '/workspaces/:workspaceId',
  WORKSPACE_PROJECTS: '/workspaces/:workspaceId/projects',
  WORKSPACE_PROJECT_DETAIL: '/workspaces/:workspaceId/projects/:projectId',
  
  // Project
  PROJECTS: '/projects',
  PROJECT_DETAIL: '/projects/:projectId',
  
  // Board
  BOARD: '/boards/:boardId',
  WORKSPACE_PROJECT_BOARD: '/workspaces/:workspaceId/projects/:projectId/boards/:boardId',
  
  // Settings
  SETTINGS: '/settings',
  
  // 404
  NOT_FOUND: '/404',
} as const;