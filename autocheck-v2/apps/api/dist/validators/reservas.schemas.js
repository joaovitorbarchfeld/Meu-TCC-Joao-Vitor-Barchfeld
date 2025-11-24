"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reservaCalendarioSchema = exports.reservaFilterSchema = exports.reservaUpdateSchema = exports.reservaCreateSchema = void 0;
const zod_1 = require("zod");
// Aceita datetime com ou sem timezone
const dateTimeSchema = zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Data inválida' });
exports.reservaCreateSchema = zod_1.z.object({
    veiculo_id: zod_1.z.string().uuid('ID do veículo inválido'),
    usuario_id: zod_1.z.string().uuid('ID do usuário inválido').optional(),
    start_at: dateTimeSchema,
    end_at: dateTimeSchema,
    motivo: zod_1.z.string().max(500, 'Motivo deve ter no máximo 500 caracteres').optional(),
}).refine((data) => new Date(data.start_at) < new Date(data.end_at), { message: 'Data de início deve ser anterior à data de fim', path: ['end_at'] }).refine((data) => {
    const startDate = new Date(data.start_at);
    const now = new Date();
    // Permite criar reserva até 5 minutos no passado (tolerância)
    const fiveMinutesAgo = new Date(now.getTime() - 60 * 60 * 1000);
    return startDate >= fiveMinutesAgo;
}, { message: 'Data de início não pode ser muito antiga (tolerância de 1 hora)', path: ['start_at'] });
exports.reservaUpdateSchema = zod_1.z.object({
    start_at: dateTimeSchema.optional(),
    end_at: dateTimeSchema.optional(),
    motivo: zod_1.z.string().max(500).optional(),
}).refine((data) => {
    if (data.start_at && data.end_at) {
        return new Date(data.start_at) < new Date(data.end_at);
    }
    return true;
}, { message: 'Data de início deve ser anterior à data de fim', path: ['end_at'] });
exports.reservaFilterSchema = zod_1.z.object({
    start: dateTimeSchema.optional(),
    end: dateTimeSchema.optional(),
    veiculo_id: zod_1.z.string().uuid().optional(),
    usuario_id: zod_1.z.string().uuid().optional(),
    status: zod_1.z.enum(['ativa', 'futura', 'passada', 'todas']).default('todas'),
    page: zod_1.z.coerce.number().int().positive().default(1),
    size: zod_1.z.coerce.number().int().positive().max(100).default(20),
});
exports.reservaCalendarioSchema = zod_1.z.object({
    start: dateTimeSchema,
    end: dateTimeSchema,
    veiculo_id: zod_1.z.string().uuid().optional(),
});
//# sourceMappingURL=reservas.schemas.js.map