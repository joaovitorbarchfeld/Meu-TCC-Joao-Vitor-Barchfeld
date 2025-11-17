import { z } from 'zod';

export const veiculoCreateSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100),
  placa: z.string().regex(/^[A-Z]{3}-?\d{1}[A-Z0-9]{1}\d{2}$|^[A-Z]{3}-?\d{4}$/, 'Placa inválida (formatos: ABC1234, ABC-1234, ABC1D23)'),
  tipo: z.enum(['sedan', 'suv', 'pickup', 'van', 'hatch']),
  combustivel: z.enum(['gasolina', 'etanol', 'diesel', 'flex', 'eletrico', 'hibrido']),
  modelo: z.string().max(100).optional(),
  cor: z.string().optional(),
  ano: z.number().int().min(1900).max(new Date().getFullYear() + 1).nullable().optional(),
  ativo: z.boolean().optional().default(true),
});

export const veiculoUpdateSchema = z.object({
  nome: z.string().min(1).max(100).optional(),
  placa: z.string().regex(/^[A-Z]{3}-?\d{1}[A-Z0-9]{1}\d{2}$|^[A-Z]{3}-?\d{4}$/).optional(),
  tipo: z.enum(['sedan', 'suv', 'pickup', 'van', 'hatch']).optional(),
  combustivel: z.enum(['gasolina', 'etanol', 'diesel', 'flex', 'eletrico', 'hibrido']).optional(),
  modelo: z.string().max(100).optional(),
  cor: z.string().optional(),
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
