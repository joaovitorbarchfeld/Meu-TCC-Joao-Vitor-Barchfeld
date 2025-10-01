-- Development seed data
INSERT INTO usuarios (id, nome, email, perfil, ativo) VALUES
(gen_random_uuid(), 'Admin Sistema', 'admin@autocheck.com', 'admin', true),
(gen_random_uuid(), 'Maria Oliveira', 'maria.oliveira@autocheck.com', 'gestor', true),
(gen_random_uuid(), 'João Silva', 'joao.silva@autocheck.com', 'colaborador', true),
(gen_random_uuid(), 'Ana Santos', 'ana.santos@autocheck.com', 'colaborador', true);

-- Sample vehicles
INSERT INTO veiculos (id, nome, placa, tipo, combustivel, cor_hex, ativo) VALUES
(gen_random_uuid(), 'Onix LT 1.0', 'BRA2A25', 'leve', 'flex', '#4A90E2', true),
(gen_random_uuid(), 'Strada Adventure', 'BRX1B23', 'utilitario', 'flex', '#E24A4A', true),
(gen_random_uuid(), 'Civic EX', 'BRZ2C45', 'leve', 'flex', '#50C878', true),
(gen_random_uuid(), 'Sprinter 415', 'BRA3D67', 'utilitario', 'diesel', '#FFD700', true);

-- Sample devices
INSERT INTO dispositivos (id, serial, modelo, status, acelerometro, giroscopio, magnetometro, barometro) VALUES
(gen_random_uuid(), 'ESP32001', 'ESP32-WROOM-32', 'nunca_pareado', true, true, true, true),
(gen_random_uuid(), 'ESP32002', 'ESP32-WROOM-32', 'nunca_pareado', true, true, true, true),
(gen_random_uuid(), 'ESP32003', 'ESP32-WROOM-32', 'nunca_pareado', true, true, true, true);