import { z } from 'zod';

export const dispositivoCreateSchema = z.object({
  identificador: z.string().min(3, 'Identificador deve ter no mínimo 3 caracteres').max(50),
  descricao: z.string().max(500).optional(),
  veiculo_id: z.string().uuid('ID do veículo inválido').nullable().optional(),
  ativo: z.boolean().default(true),
});

export const dispositivoUpdateSchema = z.object({
  identificador: z.string().min(3).max(50).optional(),
  descricao: z.string().max(500).optional(),
  ativo: z.boolean().optional(),
});

export const dispositivoVincularSchema = z.object({
  veiculo_id: z.string().uuid('ID do veículo inválido'),
});

export const dispositivoValidarSchema = z.object({
  identificador: z.string().min(1, 'Identificador é obrigatório'),
  placa: z.string().regex(/^[A-Z]{3}-\d{4}$/, 'Placa inválida (formato: ABC-1234)'),
});

export const dispositivoFilterSchema = z.object({
  q: z.string().optional(),
  ativo: z.coerce.boolean().optional(),
  com_veiculo: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  size: z.coerce.number().int().positive().max(100).default(20),
});

export type DispositivoCreateInput = z.infer<typeof dispositivoCreateSchema>;
export type DispositivoUpdateInput = z.infer<typeof dispositivoUpdateSchema>;
export type DispositivoVincularInput = z.infer<typeof dispositivoVincularSchema>;
export type DispositivoValidarInput = z.infer<typeof dispositivoValidarSchema>;
export type DispositivoFilter = z.infer<typeof dispositivoFilterSchema>;