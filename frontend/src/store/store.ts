import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './rootReducer';
import { socketMiddleware } from '../middleware/socket.middleware';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(socketMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;