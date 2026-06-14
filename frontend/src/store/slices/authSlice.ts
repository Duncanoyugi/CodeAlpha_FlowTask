import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AuthState, User, LoginCredentials, RegisterCredentials } from '@/types/auth.types';
import { authService } from '@/services/auth.service';
import { storeUser, clearAuthData, getStoredUser } from '@utils/token';

const loadStoredUserFromSession = (): { user: User | null; isAuthenticated: boolean } => {
  try {
    const stored = getStoredUser();
    if (stored?.userId) {
      return {
        user: {
          id: stored.userId,
        } as User,
        isAuthenticated: true,
      };
    }
  } catch {
    // ignore
  }
  return { user: null, isAuthenticated: false };
};

const { user: storedUser, isAuthenticated: storedAuth } = loadStoredUserFromSession();

const initialState: AuthState = {
  user: storedUser,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: storedAuth,
  isLoading: storedAuth,
  error: null,
};

// Async Thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response.data.data;
    } catch (_error: unknown) {
      const message =
        _error instanceof Error
          ? _error.message
          : 'Login failed';
      return rejectWithValue(message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.register(credentials);
      return response.data.data;
    } catch (_error: unknown) {
      const message =
        _error instanceof Error
          ? _error.message
          : 'Registration failed';
      return rejectWithValue(message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      clearAuthData();
      return null;
    } catch (_error: unknown) {
      const message =
        _error instanceof Error
          ? _error.message
          : 'Logout failed';
      clearAuthData();
      return rejectWithValue(message);
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authService.getMe();
      return data as { userId: string };
    } catch (_error: unknown) {
      const message =
        _error instanceof Error
          ? _error.message
          : 'Failed to get user';
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      storeUser({ userId: action.payload.user.id });
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Register
    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      storeUser({ userId: action.payload.user.id });
    });
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Logout
    builder.addCase(logout.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
    });
    builder.addCase(logout.rejected, (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
    });

    // Get Current User
    builder.addCase(getCurrentUser.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getCurrentUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      const data = action.payload as { userId?: string };
      if (data.userId) {
        storeUser({ userId: data.userId });
      }
    });
    builder.addCase(getCurrentUser.rejected, (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      clearAuthData();
    });
  },
});

export const { clearError, setUser, updateUser, setAccessToken } = authSlice.actions;
export default authSlice.reducer;