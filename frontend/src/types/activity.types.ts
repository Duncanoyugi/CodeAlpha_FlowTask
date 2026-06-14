export interface Activity {
  id: string;
  action: string;
  details?: Record<string, any>;
  userId: string;
  taskId?: string;
  projectId?: string;
  workspaceId?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
  };
  createdAt: string;
}
