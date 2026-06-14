import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { taskService } from '@services/task.service';
import type { Task, CreateTaskData, UpdateTaskData, MoveTaskData } from '@/types/task.types';

interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  currentTask: null,
  isLoading: false,
  error: null,
};

export const fetchTasks = createAsyncThunk(
  'task/fetchAll',
  async (boardId: string, { rejectWithValue }) => {
    try {
      const response = await taskService.getBoardTasks(boardId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  'task/fetchById',
  async (taskId: string, { rejectWithValue }) => {
    try {
      const response = await taskService.getTask(taskId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch task');
    }
  }
);

export const createTask = createAsyncThunk(
  'task/create',
  async ({ boardId, columnId, data }: { boardId: string; columnId: string; data: CreateTaskData }, { rejectWithValue }) => {
    try {
      const response = await taskService.createTask(boardId, columnId, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'task/update',
  async ({ taskId, data }: { taskId: string; data: UpdateTaskData }, { rejectWithValue }) => {
    try {
      const response = await taskService.updateTask(taskId, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update task');
    }
  }
);

export const moveTask = createAsyncThunk(
  'task/move',
  async ({ taskId, data }: { taskId: string; data: MoveTaskData }, { rejectWithValue }) => {
    try {
      const response = await taskService.moveTask(taskId, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to move task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'task/delete',
  async (taskId: string, { rejectWithValue }) => {
    try {
      await taskService.deleteTask(taskId);
      return taskId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete task');
    }
  }
);

export const reorderTasks = createAsyncThunk(
  'task/reorder',
  async ({ columnId, taskIds }: { columnId: string; taskIds: string[] }, { rejectWithValue }) => {
    try {
      await taskService.reorderTasks(columnId, taskIds);
      return { columnId, taskIds };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reorder tasks');
    }
  }
);

const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tasks
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Task By ID
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.currentTask = action.payload;
      })
      // Create Task
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
      })
      // Update Task
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = action.payload;
        }
      })
      // Move Task
      .addCase(moveTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      // Delete Task
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t.id !== action.payload);
        if (state.currentTask?.id === action.payload) {
          state.currentTask = null;
        }
      })
      // Reorder Tasks
      .addCase(reorderTasks.fulfilled, (state, action) => {
        const { columnId, taskIds } = action.payload;
        const tasksInColumn = state.tasks.filter(t => t.columnId === columnId);
        const reorderedTasks = taskIds.map((id, index) => ({
          ...tasksInColumn.find(t => t.id === id)!,
          position: (index + 1) * 100,
        }));
        
        // Update tasks in state
        for (const task of reorderedTasks) {
          const index = state.tasks.findIndex(t => t.id === task.id);
          if (index !== -1) {
            state.tasks[index] = task;
          }
        }
      });
  },
});

export const { clearError, clearCurrentTask } = taskSlice.actions;
export default taskSlice.reducer;