import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { boardService } from '@/services/board.service';
import { columnService } from '@/services/column.service';
import type { Board, Column } from '@/types/board.types';

interface BoardState {
  boards: Board[];
  currentBoard: Board | null;
  columns: Column[];
  isLoading: boolean;
  error: string | null;
}

const initialState: BoardState = {
  boards: [],
  currentBoard: null,
  columns: [],
  isLoading: false,
  error: null,
};

export const fetchBoardById = createAsyncThunk(
  'board/fetchById',
  async (boardId: string, { rejectWithValue }) => {
    try {
      const response = await boardService.getBoard(boardId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch board');
    }
  }
);

export const fetchProjectBoards = createAsyncThunk(
  'board/fetchProjectBoards',
  async ({ workspaceId, projectId }: { workspaceId: string; projectId: string }, { rejectWithValue }) => {
    try {
      const response = await boardService.getProjectBoards(workspaceId, projectId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch boards');
    }
  }
);

export const fetchColumns = createAsyncThunk(
  'board/fetchColumns',
  async (boardId: string, { rejectWithValue }) => {
    try {
      const response = await columnService.getBoardColumns(boardId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch columns');
    }
  }
);

export const createColumn = createAsyncThunk(
  'board/createColumn',
  async ({ boardId, data }: { boardId: string; data: { name: string } }, { rejectWithValue }) => {
    try {
      const response = await columnService.createColumn(boardId, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create column');
    }
  }
);

export const updateColumn = createAsyncThunk(
  'board/updateColumn',
  async ({ boardId, columnId, data }: { boardId: string; columnId: string; data: { name: string } }, { rejectWithValue }) => {
    try {
      const response = await columnService.updateColumn(boardId, columnId, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update column');
    }
  }
);

export const deleteColumn = createAsyncThunk(
  'board/deleteColumn',
  async ({ boardId, columnId }: { boardId: string; columnId: string }, { rejectWithValue }) => {
    try {
      await columnService.deleteColumn(boardId, columnId);
      return columnId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete column');
    }
  }
);

export const reorderColumns = createAsyncThunk(
  'board/reorderColumns',
  async ({ boardId, columnIds }: { boardId: string; columnIds: string[] }, { rejectWithValue }) => {
    try {
      await columnService.reorderColumns(boardId, columnIds);
      return columnIds;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reorder columns');
    }
  }
);

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentBoard: (state) => {
      state.currentBoard = null;
      state.columns = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Board By ID
      .addCase(fetchBoardById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBoardById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBoard = action.payload;
      })
      .addCase(fetchProjectBoards.fulfilled, (state, action) => {
        state.boards = action.payload;
      })
      .addCase(fetchBoardById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Columns
      .addCase(fetchColumns.fulfilled, (state, action) => {
        state.columns = action.payload;
      })
      // Create Column
      .addCase(createColumn.fulfilled, (state, action) => {
        state.columns.push(action.payload);
      })
      // Update Column
      .addCase(updateColumn.fulfilled, (state, action) => {
        const index = state.columns.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.columns[index] = action.payload;
        }
      })
      // Delete Column
      .addCase(deleteColumn.fulfilled, (state, action) => {
        state.columns = state.columns.filter(c => c.id !== action.payload);
      })
      // Reorder Columns
      .addCase(reorderColumns.fulfilled, (state, action) => {
        const reorderedColumns = action.payload.map((id, index) => ({
          ...state.columns.find(c => c.id === id)!,
          position: (index + 1) * 100,
        }));
        state.columns = reorderedColumns;
      });
  },
});

export const { clearError, clearCurrentBoard } = boardSlice.actions;
export default boardSlice.reducer;