"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usuarioFilterSchema = exports.usuarioTrocarSenhaSchema = exports.usuarioUpdateSchema = exports.usuarioCreateSchema = void 0;
const zod_1 = require("zod");
exports.usuarioCreateSchema = zod_1.z.object({
    nome: zod_1.z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100),
    email: zod_1.z.string().email('Email inválido').max(150),
    senha: zod_1.z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').max(100),
    perfil: zod_1.z.enum(['colaborador', 'gestor', 'admin']),
    ativo: zod_1.z.boolean().default(true),
});
exports.usuarioUpdateSchema = zod_1.z.object({
    nome: zod_1.z.string().min(3).max(100).optional(),
    email: zod_1.z.string().email().max(150).optional(),
    perfil: zod_1.z.enum(['colaborador', 'gestor', 'admin']).optional(),
    ativo: zod_1.z.boolean().optional(),
});
exports.usuarioTrocarSenhaSchema = zod_1.z.object({
    senha_atual: zod_1.z.string().min(6),
    senha_nova: zod_1.z.string().min(6, 'Senha nova deve ter no mínimo 6 caracteres').max(100),
    confirmar_senha: zod_1.z.string(),
}).refine((data) => data.senha_nova === data.confirmar_senha, { message: 'As senhas não coincidem', path: ['confirmar_senha'] });
exports.usuarioFilterSchema = zod_1.z.object({
    q: zod_1.z.string().optional(),
    perfil: zod_1.z.enum(['colaborador', 'gestor', 'admin']).optional(),
    ativo: zod_1.z.coerce.boolean().optional(),
    page: zod_1.z.coerce.number().int().positive().default(1),
    size: zod_1.z.coerce.number().int().positive().max(100).default(20),
});
//# sourceMappingURL=usuarios.schemas.js.map