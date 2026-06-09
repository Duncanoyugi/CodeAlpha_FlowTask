import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { UnauthorizedError } from '../utils/error';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    
    req.user = {
      userId: payload.userId,
      email: payload.email,
    };
    
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired token'));
  }
};

// Socket.io middleware version
export const socketAuthMiddleware = (token: string) => {
  try {
    const payload = verifyAccessToken(token);
    return { userId: payload.userId, email: payload.email };
  } catch (error) {
    return null;
  }
};