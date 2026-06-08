"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const prisma_1 = require("../generated/prisma");
const error_1 = require("../utils/error");
const http_1 = require("../constants/http");
const logger_1 = __importDefault(require("../lib/logger"));
const errorHandler = (err, req, res, _next) => {
    // Log error
    logger_1.default.error({
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userId: req.user?.id,
    });
    // Handle AppError (our custom errors)
    if (err instanceof error_1.AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            details: err.details,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        });
        return;
    }
    // Handle Prisma known errors
    if (err instanceof prisma_1.Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002':
                res.status(http_1.HttpStatus.CONFLICT).json({
                    success: false,
                    message: `A record with this ${err.meta?.target} already exists`,
                });
                return;
            case 'P2025':
                res.status(http_1.HttpStatus.NOT_FOUND).json({
                    success: false,
                    message: 'Record not found',
                });
                return;
            case 'P2003':
                res.status(http_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: 'Invalid reference to related record',
                });
                return;
            default:
                res.status(http_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: 'Database error occurred',
                    ...(process.env.NODE_ENV === 'development' && { code: err.code }),
                });
                return;
        }
    }
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        res.status(http_1.HttpStatus.UNAUTHORIZED).json({
            success: false,
            message: 'Invalid token',
        });
        return;
    }
    if (err.name === 'TokenExpiredError') {
        res.status(http_1.HttpStatus.UNAUTHORIZED).json({
            success: false,
            message: 'Token expired',
        });
        return;
    }
    // Default error
    res.status(http_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'Something went wrong'
            : err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
