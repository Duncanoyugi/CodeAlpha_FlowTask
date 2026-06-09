import { Server as HttpServer } from 'http';
import { initializeSocket } from '../config/socket';

export const setupSocketIO = (server: HttpServer) => {
  const io = initializeSocket(server);
  return io;
};