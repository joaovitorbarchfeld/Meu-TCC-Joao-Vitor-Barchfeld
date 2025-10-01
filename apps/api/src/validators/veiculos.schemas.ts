import { z } from 'zod';

export const VeiculoCreateSchema = z.object({
  nome: z.string().min(1),
  placa: z.string().regex(/^[A-Z]{3}\d[A-Z]\d{2}$/i, 'Formato de placa inválido'),
  renavam: z.string().optional(),
  chassi: z.string().optional(),
  tipo: z.enum(['leve', 'utilitario', 'moto', 'caminhao', 'outro']).default('leve'),
  ano_modelo: z.number().int().min(1950).max(new Date().getFullYear() + 1).optional(),
  combustivel: z.enum(['gasolina', 'etanol', 'diesel', 'flex', 'elétrico', 'gnv', 'outro']).optional(),
  odometro: z.number().int().min(0).default(0),
  consumo_medio: z.number().positive().optional(),
  cor_hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor hex inválida'),
  unidade_id: z.string().uuid().optional(),
  ativo: z.boolean().default(true),
});

export const VeiculoUpdateSchema = VeiculoCreateSchema.partial();