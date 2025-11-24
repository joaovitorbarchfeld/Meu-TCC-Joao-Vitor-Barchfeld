import type { ColumnType } from 'kysely';
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U> ? ColumnType<S, I | undefined, U> : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;
export interface Usuario {
    id: Generated<string>;
    nome: string;
    email: string;
    senha_hash: string;
    perfil: 'colaborador' | 'gestor' | 'admin';
    ativo: Generated<boolean>;
    created_at: Generated<Timestamp>;
    updated_at: Generated<Timestamp>;
}
export interface Veiculo {
    id: Generated<string>;
    nome: string;
    placa: string;
    tipo: 'sedan' | 'suv' | 'pickup' | 'van' | 'hatch';
    combustivel: 'gasolina' | 'etanol' | 'diesel' | 'flex' | 'eletrico' | 'hibrido';
    cor_hex: Generated<string>;
    ano: number | null;
    ativo: Generated<boolean>;
    created_at: Generated<Timestamp>;
    updated_at: Generated<Timestamp>;
}
export interface Dispositivo {
    id: Generated<string>;
    identificador: string;
    descricao: string | null;
    veiculo_id: string | null;
    ativo: Generated<boolean>;
    created_at: Generated<Timestamp>;
    updated_at: Generated<Timestamp>;
}
export interface Reserva {
    id: Generated<string>;
    veiculo_id: string;
    usuario_id: string;
    start_at: Timestamp;
    end_at: Timestamp;
    motivo: string | null;
    created_at: Generated<Timestamp>;
    updated_at: Generated<Timestamp>;
}
export interface AuthRefreshToken {
    id: Generated<string>;
    usuario_id: string;
    token_hash: string;
    expires_at: Timestamp;
    created_at: Generated<Timestamp>;
}
export interface AuditoriaLog {
    id: Generated<string>;
    usuario_id: string | null;
    dispositivo_id: string | null;
    veiculo_id: string | null;
    acao: string;
    detalhes: unknown | null;
    created_at: Generated<Timestamp>;
}
export interface Database {
    usuarios: Usuario;
    veiculos: Veiculo;
    dispositivos: Dispositivo;
    reservas: Reserva;
    auth_refresh_tokens: AuthRefreshToken;
    auditoria_logs: AuditoriaLog;
}
export type VeiculoStatus = 'inativo' | 'em_uso' | 'sem_dispositivo' | 'disponivel';
