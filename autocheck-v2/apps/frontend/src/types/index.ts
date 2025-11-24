export interface User {
  id: string;
  nome: string;
  email: string;
  perfil: 'colaborador' | 'gestor' | 'admin';
  ativo: boolean;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface Veiculo {
  id: string;
  nome: string;
  placa: string;
  tipo: string;
  combustivel: string;
  cor_hex: string;
  ano: number | null;
  ativo: boolean;
  status?: 'inativo' | 'em_uso' | 'sem_dispositivo' | 'disponivel';
  usuario_nome?: string;
}

export interface Reserva {
  id: string;
  veiculo_id: string;
  usuario_id: string;
  start_at: string;
  end_at: string;
  motivo: string | null;
  veiculo_nome?: string;
  veiculo_placa?: string;
  usuario_nome?: string;
}
