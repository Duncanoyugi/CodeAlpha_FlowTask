"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_schema_1 = require("./auth.schema");
const auth_middleware_1 = require("../../../src/middleware/auth.middleware");
const validation_middleware_1 = require("../../../src/middleware/validation.middleware");
const rate_limiter_1 = require("../../../src/middleware/rate-limiter");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
// Public routes
router.post('/register', (0, validation_middleware_1.validate)(auth_schema_1.RegisterSchema), authController.register);
router.post('/login', rate_limiter_1.authLimiter, (0, validation_middleware_1.validate)(auth_schema_1.LoginSchema), authController.login);
router.post('/refresh-token', rate_limiter_1.authLimiter, authController.refreshToken);
// Protected routes
router.post('/logout', auth_middleware_1.authMiddleware, authController.logout);
router.post('/logout-all', auth_middleware_1.authMiddleware, authController.logoutAll);
router.get('/me', auth_middleware_1.authMiddleware, authController.getMe);
exports.default = router;
