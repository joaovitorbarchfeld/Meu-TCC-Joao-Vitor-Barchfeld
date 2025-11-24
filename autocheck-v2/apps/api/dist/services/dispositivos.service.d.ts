import type { DispositivoCreateInput, DispositivoUpdateInput, DispositivoVincularInput, DispositivoValidarInput, DispositivoFilter } from '../validators/dispositivos.schemas';
export declare class DispositivosService {
    list(filters: DispositivoFilter): Promise<{
        data: {
            id: string;
            ativo: boolean;
            created_at: Date;
            updated_at: Date;
            veiculo_id: string | null;
            identificador: string;
            descricao: string | null;
            veiculo_nome: string | null;
            veiculo_placa: string | null;
        }[];
        meta: {
            page: number;
            size: number;
            total: number;
            totalPages: number;
        };
    }>;
    getById(id: string): Promise<{
        id: string;
        ativo: boolean;
        created_at: Date;
        updated_at: Date;
        veiculo_id: string | null;
        identificador: string;
        descricao: string | null;
        veiculo_nome: string | null;
        veiculo_placa: string | null;
        veiculo_cor: string | null;
        veiculo_tipo: "sedan" | "suv" | "pickup" | "van" | "hatch" | null;
    }>;
    create(input: DispositivoCreateInput): Promise<{
        id: string;
        ativo: boolean;
        created_at: Date;
        updated_at: Date;
        veiculo_id: string | null;
        identificador: string;
        descricao: string | null;
    }>;
    update(id: string, input: DispositivoUpdateInput): Promise<{
        id: string;
        ativo: boolean;
        created_at: Date;
        updated_at: Date;
        veiculo_id: string | null;
        identificador: string;
        descricao: string | null;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
    vincular(id: string, input: DispositivoVincularInput): Promise<{
        id: string;
        ativo: boolean;
        created_at: Date;
        updated_at: Date;
        veiculo_id: string | null;
        identificador: string;
        descricao: string | null;
    }>;
    desvincular(id: string): Promise<{
        id: string;
        ativo: boolean;
        created_at: Date;
        updated_at: Date;
        veiculo_id: string | null;
        identificador: string;
        descricao: string | null;
    }>;
    validar(input: DispositivoValidarInput): Promise<{
        permitido: boolean;
        mensagem: string;
        codigo: string;
        reserva?: undefined;
        veiculo?: undefined;
    } | {
        permitido: boolean;
        mensagem: string;
        codigo: string;
        reserva: {
            usuario_nome: string;
            usuario_email: string;
            inicio: Date;
            fim: Date;
            motivo: string | null;
        };
        veiculo: {
            nome: string;
        };
    } | {
        permitido: boolean;
        mensagem: string;
        codigo: string;
        veiculo: {
            nome: string;
        };
        reserva?: undefined;
    }>;
}
export declare const dispositivosService: DispositivosService;
