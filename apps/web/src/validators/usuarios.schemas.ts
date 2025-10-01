import { z } from 'zod';

export const UsuarioCreateSchema = z.object({
  nome: z.string().min(1),
  email: z.string().email().optional(),
  telefone: z.string().optional(),
  cpf: z.string().optional(),
  cnh_numero: z.string().optional(),
  cnh_categoria: z.enum(['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE']).optional(),
  cnh_validade: z.string().optional(),
  perfil: z.enum(['colaborador', 'gestor', 'admin']).default('colaborador'),
  unidade_id: z.string().uuid().optional(),
  cargo: z.string().optional(),
  avatar_url: z.string().optional(),
  observacao: z.string().optional(),
  ativo: z.boolean().default(true),
});

export const UsuarioUpdateSchema = UsuarioCreateSchema.partial();