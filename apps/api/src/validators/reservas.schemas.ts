import { z } from 'zod';

const ReservaBaseSchema = z.object({
  veiculo_id: z.string().uuid(),
  user_id: z.string().uuid(),
  start_at: z.string().datetime(),
  end_at: z.string().datetime(),
  note: z.string().max(500).optional(),
});

export const ReservaCreateSchema = ReservaBaseSchema.refine(data => new Date(data.end_at) > new Date(data.start_at), {
  path: ['end_at'],
  message: 'end_at deve ser maior que start_at'
});

export const ReservaUpdateSchema = ReservaBaseSchema.partial();