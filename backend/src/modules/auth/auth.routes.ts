import { Router } from 'express';
import { AuthController } from './auth.controller';
import { RegisterSchema, LoginSchema } from './auth.schema';
import { authMiddleware } from '../../../src/middleware/auth.middleware';
import { validate } from '../../../src/middleware/validation.middleware';
import { authLimiter } from '../../../src/middleware/rate-limiter';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', validate(RegisterSchema), authController.register);
router.post('/login', authLimiter, validate(LoginSchema), authController.login);
router.post('/refresh-token', authLimiter, authController.refreshToken);

// Protected routes
router.post('/logout', authMiddleware, authController.logout);
router.post('/logout-all', authMiddleware, authController.logoutAll);
router.get('/me', authMiddleware, authController.getMe);

export default router;