import { Socket } from 'socket.io';
import { verifyAccessToken } from '../../utils/jwt';

export const socketAuthMiddleware = (socket: Socket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    
    const payload = verifyAccessToken(token);
    socket.data.userId = payload.userId;
    socket.data.email = payload.email;
    
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
};