"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = require("./middleware/cors");
const rate_limiter_1 = require("./middleware/rate-limiter");
const error_middleware_1 = require("./middleware/error.middleware");
const logger_1 = __importDefault(require("./lib/logger"));
const v1_1 = __importDefault(require("./routes/v1"));
const app = (0, express_1.default)();
// Middleware
app.use(cors_1.corsMiddleware);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(rate_limiter_1.limiter);
// Request logging
app.use((req, _res, next) => {
    logger_1.default.http(`${req.method} ${req.url}`);
    next();
});
// Health check (simple)
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
// API routes
app.use('/api/v1', v1_1.default);
// Error handler (must be last)
app.use(error_middleware_1.errorHandler);
exports.default = app;
