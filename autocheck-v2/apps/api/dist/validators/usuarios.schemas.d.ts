import { z } from 'zod';
export declare const usuarioCreateSchema: z.ZodObject<{
    nome: z.ZodString;
    email: z.ZodString;
    senha: z.ZodString;
    perfil: z.ZodEnum<["colaborador", "gestor", "admin"]>;
    ativo: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    perfil: "colaborador" | "gestor" | "admin";
    nome: string;
    email: string;
    ativo: boolean;
    senha: string;
}, {
    perfil: "colaborador" | "gestor" | "admin";
    nome: string;
    email: string;
    senha: string;
    ativo?: boolean | undefined;
}>;
export declare const usuarioUpdateSchema: z.ZodObject<{
    nome: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    perfil: z.ZodOptional<z.ZodEnum<["colaborador", "gestor", "admin"]>>;
    ativo: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    perfil?: "colaborador" | "gestor" | "admin" | undefined;
    nome?: string | undefined;
    email?: string | undefined;
    ativo?: boolean | undefined;
}, {
    perfil?: "colaborador" | "gestor" | "admin" | undefined;
    nome?: string | undefined;
    email?: string | undefined;
    ativo?: boolean | undefined;
}>;
export declare const usuarioTrocarSenhaSchema: z.ZodEffects<z.ZodObject<{
    senha_atual: z.ZodString;
    senha_nova: z.ZodString;
    confirmar_senha: z.ZodString;
}, "strip", z.ZodTypeAny, {
    senha_atual: string;
    senha_nova: string;
    confirmar_senha: string;
}, {
    senha_atual: string;
    senha_nova: string;
    confirmar_senha: string;
}>, {
    senha_atual: string;
    senha_nova: string;
    confirmar_senha: string;
}, {
    senha_atual: string;
    senha_nova: string;
    confirmar_senha: string;
}>;
export declare const usuarioFilterSchema: z.ZodObject<{
    q: z.ZodOptional<z.ZodString>;
    perfil: z.ZodOptional<z.ZodEnum<["colaborador", "gestor", "admin"]>>;
    ativo: z.ZodOptional<z.ZodBoolean>;
    page: z.ZodDefault<z.ZodNumber>;
    size: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    size: number;
    perfil?: "colaborador" | "gestor" | "admin" | undefined;
    ativo?: boolean | undefined;
    q?: string | undefined;
}, {
    perfil?: "colaborador" | "gestor" | "admin" | undefined;
    ativo?: boolean | undefined;
    q?: string | undefined;
    page?: number | undefined;
    size?: number | undefined;
}>;
export type UsuarioCreateInput = z.infer<typeof usuarioCreateSchema>;
export type UsuarioUpdateInput = z.infer<typeof usuarioUpdateSchema>;
export type UsuarioTrocarSenhaInput = z.infer<typeof usuarioTrocarSenhaSchema>;
export type UsuarioFilter = z.infer<typeof usuarioFilterSchema>;
