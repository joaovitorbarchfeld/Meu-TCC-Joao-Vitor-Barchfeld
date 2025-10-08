export type PerfilEnum = 'colaborador' | 'gestor' | 'admin';
export type TipoVeiculoEnum = 'leve' | 'utilitario' | 'moto' | 'caminhao' | 'outro';
export type CombustivelEnum = 'gasolina' | 'etanol' | 'diesel' | 'flex' | 'elétrico' | 'gnv' | 'outro';
export type CNHCategoriaEnum = 'A' | 'B' | 'C' | 'D' | 'E' | 'AB' | 'AC' | 'AD' | 'AE';
export type StatusDispositivoEnum = 'conectado' | 'offline' | 'nunca_pareado';
export type VehicleStatusEnum = 'disponivel' | 'em_uso' | 'offline' | 'sem_dispositivo' | 'inativo';

export interface Database {
  usuarios: any;
  veiculos: any;
  dispositivos: any;
  reservas: any;
  telemetria: any;
  auditoria_logs: any;
  auth_refresh_tokens: any;
}