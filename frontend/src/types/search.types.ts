export interface SearchResults {
  tasks: any[];
  projects: any[];
  comments: any[];
  users: any[];
}

export interface TaskSearchFilters {
  query?: string;
  assigneeId?: string;
  priority?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}
