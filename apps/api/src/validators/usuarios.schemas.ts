import { z } from 'zod';

export const usuarioCreateSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100),
  email: z.string().email('Email inválido').max(150),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').max(100),
  perfil: z.enum(['colaborador', 'gestor', 'admin']),
  ativo: z.boolean().default(true),
});

export const usuarioUpdateSchema = z.object({
  nome: z.string().min(3).max(100).optional(),
  email: z.string().email().max(150).optional(),
  perfil: z.enum(['colaborador', 'gestor', 'admin']).optional(),
  ativo: z.boolean().optional(),
});

export const usuarioTrocarSenhaSchema = z.object({
  senha_atual: z.string().min(6),
  senha_nova: z.string().min(6, 'Senha nova deve ter no mínimo 6 caracteres').max(100),
  confirmar_senha: z.string(),
}).refine(
  (data) => data.senha_nova === data.confirmar_senha,
  { message: 'As senhas não coincidem', path: ['confirmar_senha'] }
);

export const usuarioFilterSchema = z.object({
  q: z.string().optional(),
  perfil: z.enum(['colaborador', 'gestor', 'admin']).optional(),
  ativo: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  size: z.coerce.number().int().positive().max(100).default(20),
});

export type UsuarioCreateInput = z.infer<typeof usuarioCreateSchema>;
export type UsuarioUpdateInput = z.infer<typeof usuarioUpdateSchema>;
export type UsuarioTrocarSenhaInput = z.infer<typeof usuarioTrocarSenhaSchema>;
export type UsuarioFilter = z.infer<typeof usuarioFilterSchema>;