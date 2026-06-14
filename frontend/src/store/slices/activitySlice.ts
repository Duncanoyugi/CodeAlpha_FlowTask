import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { activityService } from '@/services/activity.service';
import type { Activity } from '@/types/activity.types';

interface ActivityState {
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ActivityState = {
  activities: [],
  isLoading: false,
  error: null,
};

export const fetchTaskActivities = createAsyncThunk(
  'activity/fetchTask',
  async ({ workspaceId, taskId }: { workspaceId: string; taskId: string }, { rejectWithValue }) => {
    try {
      const response = await activityService.getTaskActivities(workspaceId, taskId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activities');
    }
  }
);

export const fetchProjectActivities = createAsyncThunk(
  'activity/fetchProject',
  async ({ workspaceId, projectId }: { workspaceId: string; projectId: string }, { rejectWithValue }) => {
    try {
      const response = await activityService.getProjectActivities(workspaceId, projectId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activities');
    }
  }
);

export const fetchWorkspaceActivities = createAsyncThunk(
  'activity/fetchWorkspace',
  async (workspaceId: string, { rejectWithValue }) => {
    try {
      const response = await activityService.getWorkspaceActivities(workspaceId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activities');
    }
  }
);

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearActivities: (state) => {
      state.activities = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTaskActivities.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTaskActivities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activities = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchTaskActivities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProjectActivities.fulfilled, (state, action) => {
        state.activities = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchWorkspaceActivities.fulfilled, (state, action) => {
        state.activities = Array.isArray(action.payload) ? action.payload : [];
      });
  },
});

export const { clearError, clearActivities } = activitySlice.actions;
export default activitySlice.reducer;
