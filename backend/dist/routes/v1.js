"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("../modules/auth/auth.routes"));
const workspace_routes_1 = __importDefault(require("../modules/workspaces/workspace.routes"));
const router = (0, express_1.Router)();
// Mount modules
router.use('/auth', auth_routes_1.default);
router.use('/workspaces', workspace_routes_1.default);
// Health check
router.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
    });
});
exports.default = router;
