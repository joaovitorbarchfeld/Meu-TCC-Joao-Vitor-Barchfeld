import { z } from 'zod';

// Aceita datetime com ou sem timezone
const dateTimeSchema = z.string().refine(
  (val) => !isNaN(Date.parse(val)),
  { message: 'Data inválida' }
);

export const reservaCreateSchema = z.object({
  veiculo_id: z.string().uuid('ID do veículo inválido'),
  usuario_id: z.string().uuid('ID do usuário inválido').optional(),
  start_at: dateTimeSchema,
  end_at: dateTimeSchema,
  motivo: z.string().max(500, 'Motivo deve ter no máximo 500 caracteres').optional(),
}).refine(
  (data) => new Date(data.start_at) < new Date(data.end_at),
  { message: 'Data de início deve ser anterior à data de fim', path: ['end_at'] }
).refine(
  (data) => {
    const startDate = new Date(data.start_at);
    const now = new Date();
    // Permite criar reserva até 5 minutos no passado (tolerância)
    const fiveMinutesAgo = new Date(now.getTime() - 60 * 60 * 1000);
    return startDate >= fiveMinutesAgo;
  },
  { message: 'Data de início não pode ser muito antiga (tolerância de 1 hora)', path: ['start_at'] }
);

export const reservaUpdateSchema = z.object({
  start_at: dateTimeSchema.optional(),
  end_at: dateTimeSchema.optional(),
  motivo: z.string().max(500).optional(),
}).refine(
  (data) => {
    if (data.start_at && data.end_at) {
      return new Date(data.start_at) < new Date(data.end_at);
    }
    return true;
  },
  { message: 'Data de início deve ser anterior à data de fim', path: ['end_at'] }
);

export const reservaFilterSchema = z.object({
  start: dateTimeSchema.optional(),
  end: dateTimeSchema.optional(),
  veiculo_id: z.string().uuid().optional(),
  usuario_id: z.string().uuid().optional(),
  status: z.enum(['ativa', 'futura', 'passada', 'todas']).default('todas'),
  page: z.coerce.number().int().positive().default(1),
  size: z.coerce.number().int().positive().max(100).default(20),
});

export const reservaCalendarioSchema = z.object({
  start: dateTimeSchema,
  end: dateTimeSchema,
  veiculo_id: z.string().uuid().optional(),
});

export type ReservaCreateInput = z.infer<typeof reservaCreateSchema>;
export type ReservaUpdateInput = z.infer<typeof reservaUpdateSchema>;
export type ReservaFilter = z.infer<typeof reservaFilterSchema>;
export type ReservaCalendarioFilter = z.infer<typeof reservaCalendarioSchema>;
