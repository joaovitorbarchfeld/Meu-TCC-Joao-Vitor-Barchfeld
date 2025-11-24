import type { ReservaCreateInput, ReservaUpdateInput, ReservaFilter, ReservaCalendarioFilter } from '../validators/reservas.schemas';
export declare class ReservasService {
    list(filters: ReservaFilter, usuarioLogadoId?: string): Promise<{
        data: {
            usuario_id: string;
            id: string;
            created_at: Date;
            veiculo_id: string;
            start_at: Date;
            end_at: Date;
            motivo: string | null;
            usuario_nome: string;
            veiculo_nome: string;
            veiculo_placa: string;
            veiculo_cor: string;
            usuario_email: string;
        }[];
        meta: {
            page: number;
            size: number;
            total: number;
            totalPages: number;
        };
    }>;
    getById(id: string): Promise<{
        usuario_id: string;
        id: string;
        created_at: Date;
        updated_at: Date;
        veiculo_id: string;
        start_at: Date;
        end_at: Date;
        motivo: string | null;
        usuario_nome: string;
        veiculo_nome: string;
        veiculo_placa: string;
        veiculo_cor: string;
        usuario_email: string;
        veiculo_tipo: "sedan" | "suv" | "pickup" | "van" | "hatch";
        usuario_perfil: "colaborador" | "gestor" | "admin";
    }>;
    create(input: ReservaCreateInput, usuarioLogadoId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        usuario_id: string;
        veiculo_id: string;
        start_at: Date;
        end_at: Date;
        motivo: string | null;
    }>;
    update(id: string, input: ReservaUpdateInput, usuarioLogadoId: string, perfil: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        usuario_id: string;
        veiculo_id: string;
        start_at: Date;
        end_at: Date;
        motivo: string | null;
    }>;
    delete(id: string, usuarioLogadoId: string, perfil: string): Promise<{
        message: string;
    }>;
    getMinhasReservas(usuarioId: string, status?: 'todas' | 'ativa' | 'futura' | 'passada'): Promise<{
        data: {
            usuario_id: string;
            id: string;
            created_at: Date;
            veiculo_id: string;
            start_at: Date;
            end_at: Date;
            motivo: string | null;
            usuario_nome: string;
            veiculo_nome: string;
            veiculo_placa: string;
            veiculo_cor: string;
            usuario_email: string;
        }[];
        meta: {
            page: number;
            size: number;
            total: number;
            totalPages: number;
        };
    }>;
    getCalendario(filters: ReservaCalendarioFilter): Promise<{
        usuario_id: string;
        id: string;
        veiculo_id: string;
        start_at: Date;
        end_at: Date;
        motivo: string | null;
        usuario_nome: string;
        veiculo_nome: string;
        veiculo_placa: string;
        veiculo_cor: string;
    }[]>;
    private checkOverlap;
}
export declare const reservasService: ReservasService;
