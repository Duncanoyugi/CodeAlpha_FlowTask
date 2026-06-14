import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './auth.dto';
import { HttpStatus } from '../../../src/constants/http';
import { env } from '../../../src/config/env';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/v1/auth/refresh-token',
};

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: RegisterDto = req.body;
      const result = await authService.register(data);

      res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: LoginDto = req.body;
      const result = await authService.login(data);

      res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'No refresh token provided',
        });
        return;
      }

      const result = await authService.refreshToken(refreshToken);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: result.accessToken,
        },
      });

      res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
    } catch (error) {
      res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh-token' });
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken || (req.body as any)?.refreshToken;
      await authService.logout(refreshToken);

      res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh-token' });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async logoutAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      await authService.logoutAll(userId);

      res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh-token' });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Logged out from all devices successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      res.status(HttpStatus.OK).json({
        success: true,
        data: { userId },
      });
    } catch (error) {
      next(error);
    }
  }
}