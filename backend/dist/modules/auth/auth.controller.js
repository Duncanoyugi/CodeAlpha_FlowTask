"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const http_1 = require("../../../src/constants/http");
const authService = new auth_service_1.AuthService();
class AuthController {
    async register(req, res, next) {
        try {
            const data = req.body;
            const result = await authService.register(data);
            res.status(http_1.HttpStatus.CREATED).json({
                success: true,
                message: 'User registered successfully',
                data: result,
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
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                message: 'Login successful',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async refreshToken(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const result = await authService.refreshToken(refreshToken);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                message: 'Token refreshed successfully',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async logout(req, res, next) {
        try {
            const { refreshToken } = req.body;
            await authService.logout(refreshToken);
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
            // You can add a getUserById method in service if needed
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
