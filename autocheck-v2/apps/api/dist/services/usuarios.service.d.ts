import type { UsuarioCreateInput, UsuarioUpdateInput, UsuarioTrocarSenhaInput, UsuarioFilter } from '../validators/usuarios.schemas';
export declare class UsuariosService {
    list(filters: UsuarioFilter): Promise<{
        data: {
            perfil: "colaborador" | "gestor" | "admin";
            id: string;
            nome: string;
            email: string;
            ativo: boolean;
            created_at: Date;
            updated_at: Date;
        }[];
        meta: {
            page: number;
            size: number;
            total: number;
            totalPages: number;
        };
    }>;
    getById(id: string): Promise<{
        estatisticas: {
            total_reservas: number;
            reservas_ativas: number;
        };
        perfil: "colaborador" | "gestor" | "admin";
        id: string;
        nome: string;
        email: string;
        ativo: boolean;
        created_at: Date;
        updated_at: Date;
    }>;
    create(input: UsuarioCreateInput): Promise<{
        perfil: "colaborador" | "gestor" | "admin";
        id: string;
        nome: string;
        email: string;
        ativo: boolean;
        created_at: Date;
    }>;
    update(id: string, input: UsuarioUpdateInput, usuarioLogadoId: string, perfilLogado: string): Promise<{
        perfil: "colaborador" | "gestor" | "admin";
        id: string;
        nome: string;
        email: string;
        ativo: boolean;
        updated_at: Date;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
    trocarSenha(id: string, input: UsuarioTrocarSenhaInput): Promise<{
        message: string;
    }>;
    getMeuPerfil(id: string): Promise<{
        estatisticas: {
            total_reservas: number;
            reservas_ativas: number;
        };
        perfil: "colaborador" | "gestor" | "admin";
        id: string;
        nome: string;
        email: string;
        ativo: boolean;
        created_at: Date;
        updated_at: Date;
    }>;
}
export declare const usuariosService: UsuariosService;
