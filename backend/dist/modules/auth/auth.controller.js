"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const http_1 = require("../../../src/constants/http");
const env_1 = require("../../../src/config/env");
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: env_1.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/v1/auth/refresh-token',
};
const authService = new auth_service_1.AuthService();
class AuthController {
    async register(req, res, next) {
        try {
            const data = req.body;
            const result = await authService.register(data);
            res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
            res.status(http_1.HttpStatus.CREATED).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const data = req.body;
            const result = await authService.login(data);
            res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                message: 'Login successful',
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async refreshToken(req, res, next) {
        try {
            const refreshToken = req.cookies?.refreshToken;
            if (!refreshToken) {
                res.status(http_1.HttpStatus.UNAUTHORIZED).json({
                    success: false,
                    message: 'No refresh token provided',
                });
                return;
            }
            const result = await authService.refreshToken(refreshToken);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    accessToken: result.accessToken,
                },
            });
            res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
        }
        catch (error) {
            res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh-token' });
            next(error);
        }
    }
    async logout(req, res, next) {
        try {
            const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
            await authService.logout(refreshToken);
            res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh-token' });
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                message: 'Logged out successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async logoutAll(req, res, next) {
        try {
            const userId = req.user?.userId;
            await authService.logoutAll(userId);
            res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh-token' });
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                message: 'Logged out from all devices successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getMe(req, res, next) {
        try {
            const userId = req.user?.userId;
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                data: { userId },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
