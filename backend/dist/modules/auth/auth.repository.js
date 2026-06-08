"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const prisma_1 = require("../../../src/lib/prisma");
class AuthRepository {
    async findUserByEmail(email) {
        return prisma_1.prisma.user.findUnique({
            where: { email },
        });
    }
    async findUserById(id) {
        return prisma_1.prisma.user.findUnique({
            where: { id },
        });
    }
    async createUser(data) {
        return prisma_1.prisma.user.create({
            data,
        });
    }
    async saveRefreshToken(data) {
        await prisma_1.prisma.refreshToken.create({
            data,
        });
    }
    async findRefreshToken(token) {
        return prisma_1.prisma.refreshToken.findUnique({
            where: { token },
            include: { user: true },
        });
    }
    async revokeRefreshToken(token) {
        await prisma_1.prisma.refreshToken.update({
            where: { token },
            data: { revokedAt: new Date() },
        });
    }
    async revokeAllUserRefreshTokens(userId) {
        await prisma_1.prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }
    async updateUserVerification(userId, isVerified) {
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { isVerified },
        });
    }
    async saveVerifyToken(userId, token, expiresAt) {
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: {
                verifyToken: token,
                verifyTokenExpiresAt: expiresAt,
            },
        });
    }
    async saveResetToken(userId, token, expiresAt) {
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: {
                resetToken: token,
                resetTokenExpiresAt: expiresAt,
            },
        });
    }
}
exports.AuthRepository = AuthRepository;
