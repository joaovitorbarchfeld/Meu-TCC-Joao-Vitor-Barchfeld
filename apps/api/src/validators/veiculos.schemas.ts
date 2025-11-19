import { z } from 'zod';

export const veiculoCreateSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100),
  placa: z.string().regex(/^[A-Z]{3}-\d{4}$/, 'Placa inválida (formato: ABC-1234)'),
  tipo: z.enum(['sedan', 'suv', 'pickup', 'van', 'hatch']),
  combustivel: z.enum(['gasolina', 'etanol', 'diesel', 'flex', 'eletrico', 'hibrido']),
  cor_hex: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor hex inválida (formato: #RRGGBB)').default('#6B7280'),
  ano: z.number().int().min(1900).max(new Date().getFullYear() + 1).nullable().optional(),
});

export const veiculoUpdateSchema = z.object({
  nome: z.string().min(1).max(100).optional(),
  placa: z.string().regex(/^[A-Z]{3}-\d{4}$/).optional(),
  tipo: z.enum(['sedan', 'suv', 'pickup', 'van', 'hatch']).optional(),
  combustivel: z.enum(['gasolina', 'etanol', 'diesel', 'flex', 'eletrico', 'hibrido']).optional(),
  cor_hex: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  ano: z.number().int().min(1900).max(new Date().getFullYear() + 1).nullable().optional(),
  ativo: z.boolean().optional(),
});

export const veiculoFilterSchema = z.object({
  q: z.string().optional(),
  tipo: z.enum(['sedan', 'suv', 'pickup', 'van', 'hatch']).optional(),
  combustivel: z.enum(['gasolina', 'etanol', 'diesel', 'flex', 'eletrico', 'hibrido']).optional(),
  ativo: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  size: z.coerce.number().int().positive().max(100).default(20),
});

export type VeiculoCreateInput = z.infer<typeof veiculoCreateSchema>;
export type VeiculoUpdateInput = z.infer<typeof veiculoUpdateSchema>;
export type VeiculoFilter = z.infer<typeof veiculoFilterSchema>;