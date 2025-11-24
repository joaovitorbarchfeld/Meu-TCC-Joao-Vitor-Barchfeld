import { z } from 'zod';
export declare const veiculoCreateSchema: z.ZodObject<{
    nome: z.ZodString;
    placa: z.ZodString;
    tipo: z.ZodEnum<["sedan", "suv", "pickup", "van", "hatch"]>;
    combustivel: z.ZodEnum<["gasolina", "etanol", "diesel", "flex", "eletrico", "hibrido"]>;
    modelo: z.ZodOptional<z.ZodString>;
    cor: z.ZodOptional<z.ZodString>;
    ano: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    ativo: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    nome: string;
    ativo: boolean;
    placa: string;
    tipo: "sedan" | "suv" | "pickup" | "van" | "hatch";
    combustivel: "gasolina" | "etanol" | "diesel" | "flex" | "eletrico" | "hibrido";
    ano?: number | null | undefined;
    modelo?: string | undefined;
    cor?: string | undefined;
}, {
    nome: string;
    placa: string;
    tipo: "sedan" | "suv" | "pickup" | "van" | "hatch";
    combustivel: "gasolina" | "etanol" | "diesel" | "flex" | "eletrico" | "hibrido";
    ativo?: boolean | undefined;
    ano?: number | null | undefined;
    modelo?: string | undefined;
    cor?: string | undefined;
}>;
export declare const veiculoUpdateSchema: z.ZodObject<{
    nome: z.ZodOptional<z.ZodString>;
    placa: z.ZodOptional<z.ZodString>;
    tipo: z.ZodOptional<z.ZodEnum<["sedan", "suv", "pickup", "van", "hatch"]>>;
    combustivel: z.ZodOptional<z.ZodEnum<["gasolina", "etanol", "diesel", "flex", "eletrico", "hibrido"]>>;
    modelo: z.ZodOptional<z.ZodString>;
    cor: z.ZodOptional<z.ZodString>;
    ano: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    ativo: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    nome?: string | undefined;
    ativo?: boolean | undefined;
    placa?: string | undefined;
    tipo?: "sedan" | "suv" | "pickup" | "van" | "hatch" | undefined;
    combustivel?: "gasolina" | "etanol" | "diesel" | "flex" | "eletrico" | "hibrido" | undefined;
    ano?: number | null | undefined;
    modelo?: string | undefined;
    cor?: string | undefined;
}, {
    nome?: string | undefined;
    ativo?: boolean | undefined;
    placa?: string | undefined;
    tipo?: "sedan" | "suv" | "pickup" | "van" | "hatch" | undefined;
    combustivel?: "gasolina" | "etanol" | "diesel" | "flex" | "eletrico" | "hibrido" | undefined;
    ano?: number | null | undefined;
    modelo?: string | undefined;
    cor?: string | undefined;
}>;
export declare const veiculoFilterSchema: z.ZodObject<{
    q: z.ZodOptional<z.ZodString>;
    tipo: z.ZodOptional<z.ZodEnum<["sedan", "suv", "pickup", "van", "hatch"]>>;
    combustivel: z.ZodOptional<z.ZodEnum<["gasolina", "etanol", "diesel", "flex", "eletrico", "hibrido"]>>;
    ativo: z.ZodOptional<z.ZodBoolean>;
    page: z.ZodDefault<z.ZodNumber>;
    size: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    size: number;
    ativo?: boolean | undefined;
    tipo?: "sedan" | "suv" | "pickup" | "van" | "hatch" | undefined;
    combustivel?: "gasolina" | "etanol" | "diesel" | "flex" | "eletrico" | "hibrido" | undefined;
    q?: string | undefined;
}, {
    ativo?: boolean | undefined;
    tipo?: "sedan" | "suv" | "pickup" | "van" | "hatch" | undefined;
    combustivel?: "gasolina" | "etanol" | "diesel" | "flex" | "eletrico" | "hibrido" | undefined;
    q?: string | undefined;
    page?: number | undefined;
    size?: number | undefined;
}>;
export type VeiculoCreateInput = z.infer<typeof veiculoCreateSchema>;
export type VeiculoUpdateInput = z.infer<typeof veiculoUpdateSchema>;
export type VeiculoFilter = z.infer<typeof veiculoFilterSchema>;
