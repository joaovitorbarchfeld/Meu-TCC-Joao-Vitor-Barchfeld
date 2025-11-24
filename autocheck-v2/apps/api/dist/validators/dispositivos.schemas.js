"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dispositivoFilterSchema = exports.dispositivoValidarSchema = exports.dispositivoVincularSchema = exports.dispositivoUpdateSchema = exports.dispositivoCreateSchema = void 0;
const zod_1 = require("zod");
exports.dispositivoCreateSchema = zod_1.z.object({
    identificador: zod_1.z.string().min(3, 'Identificador deve ter no mínimo 3 caracteres').max(50),
    descricao: zod_1.z.string().max(500).optional(),
    veiculo_id: zod_1.z.string().uuid('ID do veículo inválido').nullable().optional(),
    ativo: zod_1.z.boolean().default(true),
});
exports.dispositivoUpdateSchema = zod_1.z.object({
    identificador: zod_1.z.string().min(3).max(50).optional(),
    descricao: zod_1.z.string().max(500).optional(),
    ativo: zod_1.z.boolean().optional(),
});
exports.dispositivoVincularSchema = zod_1.z.object({
    veiculo_id: zod_1.z.string().uuid('ID do veículo inválido'),
});
exports.dispositivoValidarSchema = zod_1.z.object({
    identificador: zod_1.z.string().min(1, 'Identificador é obrigatório'),
    placa: zod_1.z.string().regex(/^[A-Z]{3}-\d{4}$/, 'Placa inválida (formato: ABC-1234)'),
});
exports.dispositivoFilterSchema = zod_1.z.object({
    q: zod_1.z.string().optional(),
    ativo: zod_1.z.coerce.boolean().optional(),
    com_veiculo: zod_1.z.coerce.boolean().optional(),
    page: zod_1.z.coerce.number().int().positive().default(1),
    size: zod_1.z.coerce.number().int().positive().max(100).default(20),
});
//# sourceMappingURL=dispositivos.schemas.js.map