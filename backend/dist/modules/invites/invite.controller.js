"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InviteController = void 0;
const invite_service_1 = require("./invite.service");
const http_1 = require("../../../src/constants/http");
const inviteService = new invite_service_1.InviteService();
class InviteController {
    async createInvite(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { workspaceId } = req.params;
            const result = await inviteService.createInvite(workspaceId, userId, req.body);
            res.status(http_1.HttpStatus.CREATED).json({
                success: true,
                message: 'Invite sent successfully',
                data: {
                    id: result.id,
                    email: result.email,
                    role: result.role,
                    expiresAt: result.expiresAt,
                    inviteLink: `${process.env.FRONTEND_URL}/invite?token=${result.token}`,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getInviteByToken(req, res, next) {
        try {
            const { token } = req.query;
            const result = await inviteService.getInviteByToken(token);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                data: {
                    workspace: result.workspace,
                    role: result.role,
                    expiresAt: result.expiresAt,
                    invitedBy: result.creator,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async acceptInvite(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { token } = req.body;
            const result = await inviteService.acceptInvite(token, userId);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                message: 'Invite accepted successfully',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getWorkspaceInvites(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { workspaceId } = req.params;
            const result = await inviteService.getWorkspaceInvites(workspaceId, userId);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async revokeInvite(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { workspaceId, inviteId } = req.params;
            await inviteService.revokeInvite(workspaceId, userId, inviteId);
            res.status(http_1.HttpStatus.OK).json({
                success: true,
                message: 'Invite revoked successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.InviteController = InviteController;
