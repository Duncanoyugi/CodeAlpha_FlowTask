import { Socket } from 'socket.io';
import { connectedUsers, SocketUser } from '../../config/socket';

export const registerPresenceHandlers = (socket: Socket) => {
  socket.on('presence:subscribe', (workspaceId: string) => {
    const usersInWorkspace = Array.from(connectedUsers.values())
      .filter((u: SocketUser) => u.workspaceId === workspaceId)
      .map((u: SocketUser) => u.userId);
    
    socket.emit('presence:list', usersInWorkspace);
  });

  socket.on('presence:ping', () => {
    socket.emit('presence:pong');
  });
};