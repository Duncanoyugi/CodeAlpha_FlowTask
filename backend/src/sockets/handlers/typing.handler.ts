import { Socket } from 'socket.io';

export const registerTypingHandlers = (socket: Socket) => {
  socket.on('typing:start', (data: { taskId: string; userId: string; userName: string }) => {
    socket.to(`task:${data.taskId}`).emit('user:typing', {
      userId: data.userId,
      userName: data.userName,
      isTyping: true,
    });
  });

  socket.on('typing:stop', (data: { taskId: string; userId: string }) => {
    socket.to(`task:${data.taskId}`).emit('user:typing', {
      userId: data.userId,
      isTyping: false,
    });
  });
};