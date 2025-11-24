"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.veiculoFilterSchema = exports.veiculoUpdateSchema = exports.veiculoCreateSchema = void 0;
const zod_1 = require("zod");
exports.veiculoCreateSchema = zod_1.z.object({
    nome: zod_1.z.string().min(1, 'Nome é obrigatório').max(100),
    placa: zod_1.z.string().regex(/^[A-Z]{3}-?\d{1}[A-Z0-9]{1}\d{2}$|^[A-Z]{3}-?\d{4}$/, 'Placa inválida (formatos: ABC1234, ABC-1234, ABC1D23)'),
    tipo: zod_1.z.enum(['sedan', 'suv', 'pickup', 'van', 'hatch']),
    combustivel: zod_1.z.enum(['gasolina', 'etanol', 'diesel', 'flex', 'eletrico', 'hibrido']),
    modelo: zod_1.z.string().max(100).optional(),
    cor: zod_1.z.string().optional(),
    ano: zod_1.z.number().int().min(1900).max(new Date().getFullYear() + 1).nullable().optional(),
    ativo: zod_1.z.boolean().optional().default(true),
});
exports.veiculoUpdateSchema = zod_1.z.object({
    nome: zod_1.z.string().min(1).max(100).optional(),
    placa: zod_1.z.string().regex(/^[A-Z]{3}-?\d{1}[A-Z0-9]{1}\d{2}$|^[A-Z]{3}-?\d{4}$/).optional(),
    tipo: zod_1.z.enum(['sedan', 'suv', 'pickup', 'van', 'hatch']).optional(),
    combustivel: zod_1.z.enum(['gasolina', 'etanol', 'diesel', 'flex', 'eletrico', 'hibrido']).optional(),
    modelo: zod_1.z.string().max(100).optional(),
    cor: zod_1.z.string().optional(),
    ano: zod_1.z.number().int().min(1900).max(new Date().getFullYear() + 1).nullable().optional(),
    ativo: zod_1.z.boolean().optional(),
});
exports.veiculoFilterSchema = zod_1.z.object({
    q: zod_1.z.string().optional(),
    tipo: zod_1.z.enum(['sedan', 'suv', 'pickup', 'van', 'hatch']).optional(),
    combustivel: zod_1.z.enum(['gasolina', 'etanol', 'diesel', 'flex', 'eletrico', 'hibrido']).optional(),
    ativo: zod_1.z.coerce.boolean().optional(),
    page: zod_1.z.coerce.number().int().positive().default(1),
    size: zod_1.z.coerce.number().int().positive().max(100).default(20),
});
//# sourceMappingURL=veiculos.schemas.js.map