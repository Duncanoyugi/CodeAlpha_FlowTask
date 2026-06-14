import { api } from '@lib/axios';
import type { LoginCredentials, RegisterCredentials, AuthResponse } from '@/types/auth.types';

export const authService = {
  login: (credentials: LoginCredentials) => {
    return api.post<AuthResponse>('/auth/login', credentials);
  },
  
  register: (credentials: RegisterCredentials) => {
    return api.post<AuthResponse>('/auth/register', credentials);
  },
  
  logout: () => {
    return api.post('/auth/logout');
  },
  
  refreshToken: (refreshToken: string) => {
    return api.post('/auth/refresh-token', { refreshToken });
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data.data;
  },
  
  forgotPassword: (email: string) => {
    return api.post('/auth/forgot-password', { email });
  },
  
  resetPassword: (token: string, password: string) => {
    return api.post('/auth/reset-password', { token, password });
  },
  
  verifyEmail: (token: string) => {
    return api.post('/auth/verify-email', { token });
  },
};