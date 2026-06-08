import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../../src/middleware/validation.middleware';
import { RegisterSchema, LoginSchema, RefreshTokenSchema } from './auth.schema';
import { authMiddleware } from '../../../src/middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', validate(RegisterSchema), authController.register);
router.post('/login', validate(LoginSchema), authController.login);
router.post('/refresh-token', validate(RefreshTokenSchema), authController.refreshToken);

// Protected routes
router.post('/logout', authMiddleware, authController.logout);
router.post('/logout-all', authMiddleware, authController.logoutAll);
router.get('/me', authMiddleware, authController.getMe);

export default router;