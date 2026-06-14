import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { searchService } from '@/services/search.service';
import type { SearchResults, TaskSearchFilters } from '@/types/search.types';

interface SearchState {
  results: SearchResults | null;
  taskResults: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: SearchState = {
  results: null,
  taskResults: [],
  isLoading: false,
  error: null,
};

export const globalSearch = createAsyncThunk(
  'search/global',
  async ({ workspaceId, query }: { workspaceId: string; query: string }, { rejectWithValue }) => {
    try {
      const response = await searchService.globalSearch(workspaceId, query);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const searchTasks = createAsyncThunk(
  'search/tasks',
  async ({ workspaceId, filters }: { workspaceId: string; filters: TaskSearchFilters }, { rejectWithValue }) => {
    try {
      const response = await searchService.searchTasks(workspaceId, filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Task search failed');
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    clearResults: (state) => {
      state.results = null;
      state.taskResults = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Global Search
      .addCase(globalSearch.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(globalSearch.fulfilled, (state, action) => {
        state.isLoading = false;
        state.results = action.payload;
      })
      .addCase(globalSearch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Task Search
      .addCase(searchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.taskResults = action.payload;
      })
      .addCase(searchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearResults, clearError } = searchSlice.actions;
export default searchSlice.reducer;