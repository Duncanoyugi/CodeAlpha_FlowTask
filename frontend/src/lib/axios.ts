import axios from 'axios';
import { clearAuthData, storeUser } from '../utils/token';

const API_URL = import.meta.env.VITE_API_URL;

let getAccessToken: (() => string | null) | null = null;

export const setAccessTokenGetter = (fn: (() => string | null) | null) => {
  getAccessToken = fn;
};

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    if (!config.headers.Authorization && getAccessToken) {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await api.post('/api/v1/auth/refresh-token');
        const { accessToken, user } = response.data.data ?? {};

        if (user) storeUser(user);
        if (accessToken && getAccessToken === null) {
          // Best-effort: avoid blocking if store isn't wired yet.
        }

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch {
        clearAuthData();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
