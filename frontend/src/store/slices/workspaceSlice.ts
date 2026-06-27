import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { workspaceService } from '@services/workspace.service';
import type { Workspace, WorkspaceMember, CreateWorkspaceData, UpdateWorkspaceData } from '@/types/workspace.types';
import { Role } from '@constants/roles';
import { getStoredUser } from '@utils/token';

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  currentRole: Role | null;
  members: WorkspaceMember[];
  isLoading: boolean;
  error: string | null;
}

const initialState: WorkspaceState = {
  workspaces: [],
  currentWorkspace: null,
  currentRole: null,
  members: [],
  isLoading: false,
  error: null,
};

// Async Thunks
export const fetchWorkspaces = createAsyncThunk(
  'workspace/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await workspaceService.getUserWorkspaces();
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch workspaces');
    }
  }
);

export const fetchWorkspaceById = createAsyncThunk(
  'workspace/fetchById',
  async (workspaceId: string, { rejectWithValue }) => {
    try {
      const response = await workspaceService.getWorkspace(workspaceId);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch workspace');
    }
  }
);

export const createWorkspace = createAsyncThunk(
  'workspace/create',
  async (data: CreateWorkspaceData, { rejectWithValue }) => {
    try {
      const response = await workspaceService.createWorkspace(data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create workspace');
    }
  }
);

export const updateWorkspace = createAsyncThunk(
  'workspace/update',
  async ({ workspaceId, data }: { workspaceId: string; data: UpdateWorkspaceData }, { rejectWithValue }) => {
    try {
      const response = await workspaceService.updateWorkspace(workspaceId, data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update workspace');
    }
  }
);

export const deleteWorkspace = createAsyncThunk(
  'workspace/delete',
  async (workspaceId: string, { rejectWithValue }) => {
    try {
      await workspaceService.deleteWorkspace(workspaceId);
      return workspaceId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete workspace');
    }
  }
);

export const fetchWorkspaceMembers = createAsyncThunk(
  'workspace/fetchMembers',
  async (workspaceId: string, { rejectWithValue }) => {
    try {
      const response = await workspaceService.getWorkspaceMembers(workspaceId);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch members');
    }
  }
);

export const updateMemberRole = createAsyncThunk(
  'workspace/updateMemberRole',
  async ({ workspaceId, memberId, role }: { workspaceId: string; memberId: string; role: string }, { rejectWithValue }) => {
    try {
      const response = await workspaceService.updateMemberRole(workspaceId, memberId, role);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update member role');
    }
  }
);

export const removeMember = createAsyncThunk(
  'workspace/removeMember',
  async ({ workspaceId, memberId }: { workspaceId: string; memberId: string }, { rejectWithValue }) => {
    try {
      await workspaceService.removeMember(workspaceId, memberId);
      return memberId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove member');
    }
  }
);

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentWorkspace: (state, action: PayloadAction<Workspace>) => {
      state.currentWorkspace = action.payload;
      state.currentRole = action.payload.currentUserRole ?? null;
    },
    clearCurrentWorkspace: (state) => {
      state.currentWorkspace = null;
      state.currentRole = null;
      state.members = [];
    },
    setCurrentRole: (state, action: PayloadAction<Role | null>) => {
      state.currentRole = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspaces.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workspaces = action.payload;
      })
      .addCase(fetchWorkspaces.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchWorkspaceById.fulfilled, (state, action) => {
        state.currentWorkspace = action.payload;
        state.currentRole = action.payload.currentUserRole ?? null;
      })
      .addCase(createWorkspace.fulfilled, (state, action) => {
        state.workspaces.unshift(action.payload);
        state.currentWorkspace = action.payload;
        state.currentRole = action.payload.currentUserRole ?? null;
      })
      .addCase(updateWorkspace.fulfilled, (state, action) => {
        const index = state.workspaces.findIndex((w) => w.id === action.payload.id);
        if (index !== -1) {
          state.workspaces[index] = action.payload;
        }
        if (state.currentWorkspace?.id === action.payload.id) {
          state.currentWorkspace = action.payload;
          state.currentRole = action.payload.currentUserRole ?? null;
        }
      })
      .addCase(deleteWorkspace.fulfilled, (state, action) => {
        state.workspaces = state.workspaces.filter((w) => w.id !== action.payload);
        if (state.currentWorkspace?.id === action.payload) {
          state.currentWorkspace = null;
        }
      })
      .addCase(fetchWorkspaceMembers.fulfilled, (state, action) => {
        state.members = action.payload;
        const storedUser = getStoredUser();
        const currentMember = action.payload.find((member) => member.user.id === storedUser?.userId);

        // Prefer backend-computed effective role from the loaded workspace.
        // Only fall back to raw member role if the backend didn't provide currentUserRole
        // (e.g., during migration / older responses).
        state.currentRole =
          state.currentWorkspace?.currentUserRole ?? currentMember?.role ?? null;
      })
      .addCase(updateMemberRole.fulfilled, (state, action) => {
        const index = state.members.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) {
          state.members[index] = action.payload;
        }
      })
      .addCase(removeMember.fulfilled, (state, action) => {
        state.members = state.members.filter((m) => m.id !== action.payload);
      });
  },
});

export const { clearError, setCurrentWorkspace, clearCurrentWorkspace, setCurrentRole } = workspaceSlice.actions;
export default workspaceSlice.reducer;
