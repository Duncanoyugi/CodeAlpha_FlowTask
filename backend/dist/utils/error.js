"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = exports.TooManyRequestsError = exports.ValidationError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.AppError = void 0;
const http_1 = require("../constants/http");
class AppError extends Error {
    statusCode;
    isOperational;
    details;
    constructor(message, statusCode, isOperational = true, details) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class BadRequestError extends AppError {
    constructor(message, details) {
        super(message, http_1.HttpStatus.BAD_REQUEST, true, details);
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized access') {
        super(message, http_1.HttpStatus.UNAUTHORIZED, true);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'You do not have permission to perform this action') {
        super(message, http_1.HttpStatus.FORBIDDEN, true);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends AppError {
    constructor(resource) {
        super(`${resource} not found`, http_1.HttpStatus.NOT_FOUND, true);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message) {
        super(message, http_1.HttpStatus.CONFLICT, true);
    }
}
exports.ConflictError = ConflictError;
class ValidationError extends AppError {
    constructor(message, details) {
        super(message, http_1.HttpStatus.UNPROCESSABLE_ENTITY, true, details);
    }
}
exports.ValidationError = ValidationError;
class TooManyRequestsError extends AppError {
    constructor(message = 'Too many requests, please try again later') {
        super(message, http_1.HttpStatus.TOO_MANY_REQUESTS, true);
    }
}
exports.TooManyRequestsError = TooManyRequestsError;
class InternalServerError extends AppError {
    constructor(message = 'Internal server error') {
        super(message, http_1.HttpStatus.INTERNAL_SERVER_ERROR, false);
    }
}
exports.InternalServerError = InternalServerError;
