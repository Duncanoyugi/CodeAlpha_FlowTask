import type { Task } from './task.types';
import type { Comment } from './comment.types';
import type { Notification } from './notification.types';

export interface SocketEvents {
  // Client -> Server
  'join:workspace': (workspaceId: string) => void;
  'join:board': (boardId: string) => void;
  'join:task': (taskId: string) => void;
  'leave:workspace': (workspaceId: string) => void;
  'leave:board': (boardId: string) => void;
  'leave:task': (taskId: string) => void;
  'typing:start': (data: { taskId: string; userId: string; userName: string }) => void;
  'typing:stop': (data: { taskId: string; userId: string }) => void;
  'task:create': (data: any) => void;
  'task:move': (data: any) => void;
  'task:update': (data: any) => void;
  'comment:add': (data: any) => void;
  'comment:edit': (data: any) => void;
  'comment:delete': (data: any) => void;
  
  // Server -> Client
  'task:created': (task: Task) => void;
  'task:moved': (data: { task: Task; oldColumnId: string; newColumnId: string }) => void;
  'task:updated': (task: Task) => void;
  'task:deleted': (data: { taskId: string; boardId: string }) => void;
  'comment:added': (comment: Comment) => void;
  'comment:updated': (comment: Comment) => void;
  'comment:deleted': (data: { commentId: string; taskId: string }) => void;
  'user:typing': (data: { userId: string; userName: string; isTyping: boolean }) => void;
  'user:online': (data: { userId: string; socketId: string }) => void;
  'user:offline': (userId: string) => void;
  'notification:new': (notification: Notification) => void;
}
