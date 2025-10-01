-- AutoCheck Database Schema
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Enums
CREATE TYPE perfil_enum AS ENUM ('colaborador', 'gestor', 'admin');
CREATE TYPE tipo_veiculo_enum AS ENUM ('leve', 'utilitario', 'moto', 'caminhao', 'outro');
CREATE TYPE combustivel_enum AS ENUM ('gasolina', 'etanol', 'diesel', 'flex', 'elétrico', 'gnv', 'outro');
CREATE TYPE cnh_categoria_enum AS ENUM ('A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE');
CREATE TYPE status_dispositivo_enum AS ENUM ('conectado', 'offline', 'nunca_pareado');

-- Tables
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR NOT NULL,
    email VARCHAR UNIQUE,
    telefone VARCHAR,
    cpf VARCHAR,
    cnh_numero VARCHAR,
    cnh_categoria cnh_categoria_enum,
    cnh_validade DATE,
    perfil perfil_enum NOT NULL DEFAULT 'colaborador',
    unidade_id UUID,
    cargo VARCHAR,
    avatar_url TEXT,
    observacao TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE veiculos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR NOT NULL,
    placa VARCHAR UNIQUE NOT NULL,
    renavam VARCHAR,
    chassi VARCHAR,
    tipo tipo_veiculo_enum NOT NULL DEFAULT 'leve',
    ano_modelo INTEGER,
    combustivel combustivel_enum,
    odometro INTEGER DEFAULT 0,
    consumo_medio NUMERIC,
    cor_hex VARCHAR NOT NULL CHECK (cor_hex ~ '^#[0-9A-Fa-f]{6}$'),
    unidade_id UUID,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE dispositivos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    serial VARCHAR UNIQUE NOT NULL,
    modelo VARCHAR NOT NULL DEFAULT 'ESP32-WROOM-32',
    status status_dispositivo_enum NOT NULL DEFAULT 'nunca_pareado',
    last_seen TIMESTAMPTZ,
    veiculo_id UUID REFERENCES veiculos(id),
    acelerometro BOOLEAN DEFAULT false,
    giroscopio BOOLEAN DEFAULT false,
    magnetometro BOOLEAN DEFAULT false,
    barometro BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reservas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    veiculo_id UUID NOT NULL REFERENCES veiculos(id),
    user_id UUID NOT NULL REFERENCES usuarios(id),
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    note TEXT,
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT reservas_end_after_start CHECK (end_at > start_at)
);

CREATE TABLE telemetria (
    id UUID DEFAULT gen_random_uuid(),
    dispositivo_id UUID NOT NULL REFERENCES dispositivos(id),
    veiculo_id UUID NOT NULL REFERENCES veiculos(id),
    ts TIMESTAMPTZ NOT NULL DEFAULT now(),
    ax REAL,
    ay REAL,
    az REAL,
    gx REAL,
    gy REAL,
    gz REAL,
    mx REAL,
    my REAL,
    mz REAL,
    pressao REAL,
    PRIMARY KEY (id, ts)
) PARTITION BY RANGE (ts);

CREATE TABLE auditoria_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID REFERENCES usuarios(id),
    entity VARCHAR NOT NULL,
    entity_id VARCHAR NOT NULL,
    action VARCHAR NOT NULL,
    payload JSONB,
    ip INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE auth_refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES usuarios(id),
    token_hash VARCHAR NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_cpf ON usuarios(cpf);
CREATE INDEX idx_usuarios_perfil ON usuarios(perfil);

CREATE INDEX idx_veiculos_placa ON veiculos(placa);
CREATE INDEX idx_veiculos_tipo ON veiculos(tipo);

CREATE INDEX idx_dispositivos_serial ON dispositivos(serial);
CREATE INDEX idx_dispositivos_veiculo_id ON dispositivos(veiculo_id);

CREATE INDEX idx_reservas_veiculo_id ON reservas(veiculo_id);
CREATE INDEX idx_reservas_user_id ON reservas(user_id);
CREATE INDEX idx_reservas_start_end ON reservas(start_at, end_at);

CREATE INDEX idx_telemetria_veiculo_ts ON telemetria(veiculo_id, ts);
CREATE INDEX idx_telemetria_dispositivo_ts ON telemetria(dispositivo_id, ts);

-- Create telemetria partitions for current and next months
CREATE TABLE telemetria_2025_09 PARTITION OF telemetria
    FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');

CREATE TABLE telemetria_2025_10 PARTITION OF telemetria
    FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

CREATE TABLE telemetria_2025_11 PARTITION OF telemetria
    FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');

CREATE TABLE telemetria_2025_12 PARTITION OF telemetria
    FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

-- Update triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_usuarios_updated_at 
    BEFORE UPDATE ON usuarios 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_veiculos_updated_at 
    BEFORE UPDATE ON veiculos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_dispositivos_updated_at 
    BEFORE UPDATE ON dispositivos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_reservas_updated_at 
    BEFORE UPDATE ON reservas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();