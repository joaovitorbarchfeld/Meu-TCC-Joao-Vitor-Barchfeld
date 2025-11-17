-- AutoCheck v2 - Database Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Usuarios
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  perfil VARCHAR(20) NOT NULL CHECK (perfil IN ('colaborador', 'gestor', 'admin')),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Veiculos
CREATE TABLE veiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  placa VARCHAR(10) UNIQUE NOT NULL,
  tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('sedan', 'suv', 'pickup', 'van', 'hatch')),
  combustivel VARCHAR(20) NOT NULL CHECK (combustivel IN ('gasolina', 'etanol', 'diesel', 'flex', 'eletrico', 'hibrido')),
  cor_hex VARCHAR(7) NOT NULL DEFAULT '#6B7280',
  ano INTEGER,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dispositivos ESP32
CREATE TABLE dispositivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identificador VARCHAR(50) UNIQUE NOT NULL,
  descricao TEXT,
  veiculo_id UUID REFERENCES veiculos(id) ON DELETE SET NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reservas
CREATE TABLE reservas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  veiculo_id UUID NOT NULL REFERENCES veiculos(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  motivo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT reservas_start_before_end CHECK (start_at < end_at)
);

CREATE INDEX idx_reservas_veiculo_periodo ON reservas(veiculo_id, start_at, end_at);

-- Tokens JWT
CREATE TABLE auth_refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auditoria
CREATE TABLE auditoria_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  dispositivo_id UUID REFERENCES dispositivos(id) ON DELETE SET NULL,
  veiculo_id UUID REFERENCES veiculos(id) ON DELETE SET NULL,
  acao VARCHAR(50) NOT NULL,
  detalhes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seeds
INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES
  ('Admin AutoCheck', 'admin@autocheck.com', crypt('autocheck123', gen_salt('bf', 11)), 'admin'),
  ('Maria Oliveira', 'maria.oliveira@autocheck.com', crypt('autocheck123', gen_salt('bf', 11)), 'gestor'),
  ('João Silva', 'joao.silva@autocheck.com', crypt('autocheck123', gen_salt('bf', 11)), 'colaborador');

INSERT INTO veiculos (nome, placa, tipo, combustivel, cor_hex, ano) VALUES
  ('Civic Preto', 'ABC-1234', 'sedan', 'flex', '#000000', 2023),
  ('Hilux Branca', 'XYZ-5678', 'pickup', 'diesel', '#FFFFFF', 2022),
  ('HRV Vermelho', 'DEF-9012', 'suv', 'flex', '#DC2626', 2024);

INSERT INTO dispositivos (identificador, descricao, veiculo_id) VALUES
  ('ESP32-PORTAO', 'Dispositivo no portão', NULL),
  ('ESP32-001', 'Dispositivo Civic', (SELECT id FROM veiculos WHERE placa = 'ABC-1234'));
