import { z } from 'zod';
export declare const reservaCreateSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    veiculo_id: z.ZodString;
    usuario_id: z.ZodOptional<z.ZodString>;
    start_at: z.ZodEffects<z.ZodString, string, string>;
    end_at: z.ZodEffects<z.ZodString, string, string>;
    motivo: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    veiculo_id: string;
    start_at: string;
    end_at: string;
    usuario_id?: string | undefined;
    motivo?: string | undefined;
}, {
    veiculo_id: string;
    start_at: string;
    end_at: string;
    usuario_id?: string | undefined;
    motivo?: string | undefined;
}>, {
    veiculo_id: string;
    start_at: string;
    end_at: string;
    usuario_id?: string | undefined;
    motivo?: string | undefined;
}, {
    veiculo_id: string;
    start_at: string;
    end_at: string;
    usuario_id?: string | undefined;
    motivo?: string | undefined;
}>, {
    veiculo_id: string;
    start_at: string;
    end_at: string;
    usuario_id?: string | undefined;
    motivo?: string | undefined;
}, {
    veiculo_id: string;
    start_at: string;
    end_at: string;
    usuario_id?: string | undefined;
    motivo?: string | undefined;
}>;
export declare const reservaUpdateSchema: z.ZodEffects<z.ZodObject<{
    start_at: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    end_at: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    motivo: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    start_at?: string | undefined;
    end_at?: string | undefined;
    motivo?: string | undefined;
}, {
    start_at?: string | undefined;
    end_at?: string | undefined;
    motivo?: string | undefined;
}>, {
    start_at?: string | undefined;
    end_at?: string | undefined;
    motivo?: string | undefined;
}, {
    start_at?: string | undefined;
    end_at?: string | undefined;
    motivo?: string | undefined;
}>;
export declare const reservaFilterSchema: z.ZodObject<{
    start: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    end: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    veiculo_id: z.ZodOptional<z.ZodString>;
    usuario_id: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<["ativa", "futura", "passada", "todas"]>>;
    page: z.ZodDefault<z.ZodNumber>;
    size: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status: "ativa" | "futura" | "passada" | "todas";
    page: number;
    size: number;
    usuario_id?: string | undefined;
    end?: string | undefined;
    veiculo_id?: string | undefined;
    start?: string | undefined;
}, {
    status?: "ativa" | "futura" | "passada" | "todas" | undefined;
    usuario_id?: string | undefined;
    end?: string | undefined;
    veiculo_id?: string | undefined;
    page?: number | undefined;
    size?: number | undefined;
    start?: string | undefined;
}>;
export declare const reservaCalendarioSchema: z.ZodObject<{
    start: z.ZodEffects<z.ZodString, string, string>;
    end: z.ZodEffects<z.ZodString, string, string>;
    veiculo_id: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    end: string;
    start: string;
    veiculo_id?: string | undefined;
}, {
    end: string;
    start: string;
    veiculo_id?: string | undefined;
}>;
export type ReservaCreateInput = z.infer<typeof reservaCreateSchema>;
export type ReservaUpdateInput = z.infer<typeof reservaUpdateSchema>;
export type ReservaFilter = z.infer<typeof reservaFilterSchema>;
export type ReservaCalendarioFilter = z.infer<typeof reservaCalendarioSchema>;
