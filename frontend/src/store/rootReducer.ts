import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import workspaceReducer from './slices/workspaceSlice';
import projectReducer from './slices/projectSlice';
import boardReducer from './slices/boardSlice';
import taskReducer from './slices/taskSlice';
import commentReducer from './slices/commentSlice';
import activityReducer from './slices/activitySlice';
import notificationReducer from './slices/notificationSlice';
import searchReducer from './slices/searchSlice';
import uiReducer from './slices/uiSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
  workspace: workspaceReducer,
  project: projectReducer,
  board: boardReducer,
  task: taskReducer,
  comment: commentReducer,
  activity: activityReducer,
  notification: notificationReducer,
  search: searchReducer,
  ui: uiReducer,
});