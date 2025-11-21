import { z } from 'zod';

export const reservaCreateSchema = z.object({
  veiculo_id: z.string().uuid('ID do veículo inválido'),
  usuario_id: z.string().uuid('ID do usuário inválido'),
  start_at: z.string().datetime('Data de início inválida'),
  end_at: z.string().datetime('Data de fim inválida'),
  motivo: z.string().max(500, 'Motivo deve ter no máximo 500 caracteres').optional(),
}).refine(
  (data) => new Date(data.start_at) < new Date(data.end_at),
  { message: 'Data de início deve ser anterior à data de fim', path: ['end_at'] }
).refine(
  (data) => new Date(data.start_at) >= new Date(),
  { message: 'Data de início não pode ser no passado', path: ['start_at'] }
);

export const reservaUpdateSchema = z.object({
  start_at: z.string().datetime('Data de início inválida').optional(),
  end_at: z.string().datetime('Data de fim inválida').optional(),
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
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
  veiculo_id: z.string().uuid().optional(),
  usuario_id: z.string().uuid().optional(),
  status: z.enum(['ativa', 'futura', 'passada', 'todas']).default('todas'),
  page: z.coerce.number().int().positive().default(1),
  size: z.coerce.number().int().positive().max(100).default(20),
});

export const reservaCalendarioSchema = z.object({
  start: z.string().datetime('Data de início obrigatória'),
  end: z.string().datetime('Data de fim obrigatória'),
  veiculo_id: z.string().uuid().optional(),
});

export type ReservaCreateInput = z.infer<typeof reservaCreateSchema>;
export type ReservaUpdateInput = z.infer<typeof reservaUpdateSchema>;
export type ReservaFilter = z.infer<typeof reservaFilterSchema>;
export type ReservaCalendarioFilter = z.infer<typeof reservaCalendarioSchema>;