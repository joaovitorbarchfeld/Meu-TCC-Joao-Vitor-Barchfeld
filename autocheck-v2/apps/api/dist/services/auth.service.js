"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
const env_1 = require("../config/env");
const errorHandler_1 = require("../middlewares/errorHandler");
class AuthService {
    async login(input) {
        const user = await db_1.db
            .selectFrom('usuarios')
            .selectAll()
            .where('email', '=', input.login)
            .where('ativo', '=', true)
            .executeTakeFirst();
        if (!user) {
            throw new errorHandler_1.AppError(401, 'Credenciais inválidas', 'INVALID_CREDENTIALS');
        }
        const passwordMatch = await bcrypt_1.default.compare(input.password, user.senha_hash);
        if (!passwordMatch) {
            throw new errorHandler_1.AppError(401, 'Credenciais inválidas', 'INVALID_CREDENTIALS');
        }
        const payload = {
            userId: user.id,
            email: user.email,
            perfil: user.perfil,
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, env_1.env.JWT_ACCESS_SECRET, {
            expiresIn: env_1.env.JWT_ACCESS_EXPIRES_IN,
        });
        const refreshToken = jsonwebtoken_1.default.sign(payload, env_1.env.JWT_REFRESH_SECRET, {
            expiresIn: env_1.env.JWT_REFRESH_EXPIRES_IN,
        });
        const refreshTokenHash = await bcrypt_1.default.hash(refreshToken, 10);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await db_1.db
            .insertInto('auth_refresh_tokens')
            .values({
            usuario_id: user.id,
            token_hash: refreshTokenHash,
            expires_at: expiresAt,
        })
            .execute();
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                perfil: user.perfil,
            },
        };
    }
    async refreshToken(refreshToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, env_1.env.JWT_REFRESH_SECRET);
            const payload = {
                userId: decoded.userId,
                email: decoded.email,
                perfil: decoded.perfil,
            };
            const newAccessToken = jsonwebtoken_1.default.sign(payload, env_1.env.JWT_ACCESS_SECRET, {
                expiresIn: env_1.env.JWT_ACCESS_EXPIRES_IN,
            });
            return { access_token: newAccessToken };
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new errorHandler_1.AppError(401, 'Refresh token expirado', 'REFRESH_TOKEN_EXPIRED');
            }
            throw error;
        }
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map