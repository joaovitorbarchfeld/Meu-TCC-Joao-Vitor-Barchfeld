"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    login: zod_1.z.string().email('Email inválido'),
    password: zod_1.z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    remember: zod_1.z.boolean().optional().default(false),
});
exports.refreshTokenSchema = zod_1.z.object({
    refresh_token: zod_1.z.string().min(1, 'Refresh token é obrigatório'),
});
//# sourceMappingURL=auth.schemas.js.map