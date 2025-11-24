import type { LoginInput } from '../validators/auth.schemas';
export declare class AuthService {
    login(input: LoginInput): Promise<{
        access_token: never;
        refresh_token: never;
        user: {
            id: string;
            nome: string;
            email: string;
            perfil: "colaborador" | "gestor" | "admin";
        };
    }>;
    refreshToken(refreshToken: string): Promise<{
        access_token: never;
    }>;
}
export declare const authService: AuthService;
