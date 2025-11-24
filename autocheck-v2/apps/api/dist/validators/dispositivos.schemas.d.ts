import { z } from 'zod';
export declare const dispositivoCreateSchema: z.ZodObject<{
    identificador: z.ZodString;
    descricao: z.ZodOptional<z.ZodString>;
    veiculo_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    ativo: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    ativo: boolean;
    identificador: string;
    veiculo_id?: string | null | undefined;
    descricao?: string | undefined;
}, {
    identificador: string;
    ativo?: boolean | undefined;
    veiculo_id?: string | null | undefined;
    descricao?: string | undefined;
}>;
export declare const dispositivoUpdateSchema: z.ZodObject<{
    identificador: z.ZodOptional<z.ZodString>;
    descricao: z.ZodOptional<z.ZodString>;
    ativo: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    ativo?: boolean | undefined;
    identificador?: string | undefined;
    descricao?: string | undefined;
}, {
    ativo?: boolean | undefined;
    identificador?: string | undefined;
    descricao?: string | undefined;
}>;
export declare const dispositivoVincularSchema: z.ZodObject<{
    veiculo_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    veiculo_id: string;
}, {
    veiculo_id: string;
}>;
export declare const dispositivoValidarSchema: z.ZodObject<{
    identificador: z.ZodString;
    placa: z.ZodString;
}, "strip", z.ZodTypeAny, {
    placa: string;
    identificador: string;
}, {
    placa: string;
    identificador: string;
}>;
export declare const dispositivoFilterSchema: z.ZodObject<{
    q: z.ZodOptional<z.ZodString>;
    ativo: z.ZodOptional<z.ZodBoolean>;
    com_veiculo: z.ZodOptional<z.ZodBoolean>;
    page: z.ZodDefault<z.ZodNumber>;
    size: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    size: number;
    ativo?: boolean | undefined;
    q?: string | undefined;
    com_veiculo?: boolean | undefined;
}, {
    ativo?: boolean | undefined;
    q?: string | undefined;
    page?: number | undefined;
    size?: number | undefined;
    com_veiculo?: boolean | undefined;
}>;
export type DispositivoCreateInput = z.infer<typeof dispositivoCreateSchema>;
export type DispositivoUpdateInput = z.infer<typeof dispositivoUpdateSchema>;
export type DispositivoVincularInput = z.infer<typeof dispositivoVincularSchema>;
export type DispositivoValidarInput = z.infer<typeof dispositivoValidarSchema>;
export type DispositivoFilter = z.infer<typeof dispositivoFilterSchema>;
