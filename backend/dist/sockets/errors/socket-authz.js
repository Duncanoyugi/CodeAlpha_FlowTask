"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketForbiddenError = void 0;
const error_1 = require("../../utils/error");
const http_1 = require("../../constants/http");
class SocketForbiddenError extends error_1.AppError {
    constructor(message = 'Forbidden') {
        super(message, http_1.HttpStatus.FORBIDDEN);
    }
}
exports.SocketForbiddenError = SocketForbiddenError;
