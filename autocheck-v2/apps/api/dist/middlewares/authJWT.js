"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authJWT = authJWT;
exports.authorize = authorize;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const errorHandler_1 = require("./errorHandler");
function authJWT(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new errorHandler_1.AppError(401, 'Token não fornecido', 'MISSING_TOKEN');
        }
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            throw new errorHandler_1.AppError(401, 'Formato de token inválido', 'INVALID_TOKEN_FORMAT');
        }
        const token = parts[1];
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_ACCESS_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new errorHandler_1.AppError(401, 'Token expirado', 'TOKEN_EXPIRED');
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new errorHandler_1.AppError(401, 'Token inválido', 'INVALID_TOKEN');
        }
        throw error;
    }
}
function authorize(...perfisPermitidos) {
    return (req, res, next) => {
        if (!req.user) {
            throw new errorHandler_1.AppError(401, 'Não autenticado', 'NOT_AUTHENTICATED');
        }
        if (!perfisPermitidos.includes(req.user.perfil)) {
            throw new errorHandler_1.AppError(403, 'Sem permissão', 'FORBIDDEN');
        }
        next();
    };
}
//# sourceMappingURL=authJWT.js.map