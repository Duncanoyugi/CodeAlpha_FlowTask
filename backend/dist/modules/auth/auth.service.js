"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const auth_repository_1 = require("./auth.repository");
const bcrypt_1 = require("../../../src/utils/bcrypt");
const jwt_1 = require("../../../src/utils/jwt");
const error_1 = require("../../../src/utils/error");
class AuthService {
    authRepository;
    constructor() {
        this.authRepository = new auth_repository_1.AuthRepository();
    }
    async register(data) {
        // Check if user exists
        const existingUser = await this.authRepository.findUserByEmail(data.email);
        if (existingUser) {
            throw new error_1.ConflictError('User with this email already exists');
        }
        // Hash password
        const passwordHash = await (0, bcrypt_1.hashPassword)(data.password);
        // Create user
        const user = await this.authRepository.createUser({
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            passwordHash,
        });
        // Generate tokens
        const payload = { userId: user.id, email: user.email };
        const accessToken = (0, jwt_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(payload);
        // Save refresh token
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
        await this.authRepository.saveRefreshToken({
            token: refreshToken,
            userId: user.id,
            expiresAt,
        });
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                avatar: user.avatar,
                isVerified: user.isVerified,
            },
            accessToken,
            refreshToken,
        };
    }
    async login(data) {
        // Find user
        const user = await this.authRepository.findUserByEmail(data.email);
        if (!user) {
            throw new error_1.UnauthorizedError('Invalid email or password');
        }
        // Check password
        const isPasswordValid = await (0, bcrypt_1.comparePassword)(data.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new error_1.UnauthorizedError('Invalid email or password');
        }
        // Generate tokens
        const payload = { userId: user.id, email: user.email };
        const accessToken = (0, jwt_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(payload);
        // Save refresh token
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.authRepository.saveRefreshToken({
            token: refreshToken,
            userId: user.id,
            expiresAt,
        });
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                avatar: user.avatar,
                isVerified: user.isVerified,
            },
            accessToken,
            refreshToken,
        };
    }
    async refreshToken(refreshToken) {
        // Verify refresh token
        let payload;
        try {
            payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
        }
        catch (error) {
            throw new error_1.UnauthorizedError('Invalid refresh token');
        }
        // Check if token exists and not revoked
        const storedToken = await this.authRepository.findRefreshToken(refreshToken);
        if (!storedToken || storedToken.revokedAt) {
            throw new error_1.UnauthorizedError('Refresh token has been revoked');
        }
        // Check if expired
        if (storedToken.expiresAt < new Date()) {
            throw new error_1.UnauthorizedError('Refresh token has expired');
        }
        // Get user
        const user = await this.authRepository.findUserById(payload.userId);
        if (!user) {
            throw new error_1.NotFoundError('User');
        }
        // Revoke old refresh token
        await this.authRepository.revokeRefreshToken(refreshToken);
        // Generate new tokens
        const newPayload = { userId: user.id, email: user.email };
        const newAccessToken = (0, jwt_1.generateAccessToken)(newPayload);
        const newRefreshToken = (0, jwt_1.generateRefreshToken)(newPayload);
        // Save new refresh token
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.authRepository.saveRefreshToken({
            token: newRefreshToken,
            userId: user.id,
            expiresAt,
        });
        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }
    async logout(refreshToken) {
        await this.authRepository.revokeRefreshToken(refreshToken);
    }
    async logoutAll(userId) {
        await this.authRepository.revokeAllUserRefreshTokens(userId);
    }
}
exports.AuthService = AuthService;
