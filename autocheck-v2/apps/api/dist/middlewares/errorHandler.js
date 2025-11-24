"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const logger_1 = require("../utils/logger");
class AppError extends Error {
    statusCode;
    message;
    code;
    constructor(statusCode, message, code) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.code = code;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
function errorHandler(err, req, res, next) {
    logger_1.logger.error({ err, req: { method: req.method, url: req.url } });
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            error: 'Erro de validação',
            details: err.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            })),
        });
    }
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: err.message,
            code: err.code,
        });
    }
    return res.status(500).json({ error: 'Erro interno do servidor' });
}
//# sourceMappingURL=errorHandler.js.map