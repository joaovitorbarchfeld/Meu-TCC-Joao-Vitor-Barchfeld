import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    login: z.ZodString;
    password: z.ZodString;
    remember: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    login: string;
    password: string;
    remember: boolean;
}, {
    login: string;
    password: string;
    remember?: boolean | undefined;
}>;
export declare const refreshTokenSchema: z.ZodObject<{
    refresh_token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refresh_token: string;
}, {
    refresh_token: string;
}>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
