import axios from 'axios';
import type { LoginResponse, User, Veiculo, Reserva } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:3000/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const { data } = await axios.post('http://localhost:3000/v1/auth/refresh', {
            refresh_token: refreshToken,
          });

          localStorage.setItem('access_token', data.access_token);
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;

          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// AUTH
export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await axios.post('http://localhost:3000/v1/auth/login', {
      login: email,
      password,
    });
    return data;
  },

  me: async (): Promise<User> => {
    const { data } = await api.get('/usuarios/me');
    return data;
  },
};

// VEÍCULOS
export const veiculosApi = {
  list: async (): Promise<Veiculo[]> => {
    const { data } = await api.get('/veiculos');
    return data.data;
  },

  getById: async (id: string): Promise<Veiculo> => {
    const { data } = await api.get(`/veiculos/${id}`);
    return data;
  },

  create: async (veiculo: Partial<Veiculo>): Promise<Veiculo> => {
    const { data } = await api.post('/veiculos', veiculo);
    return data;
  },

  update: async (id: string, veiculo: Partial<Veiculo>): Promise<Veiculo> => {
    const { data } = await api.put(`/veiculos/${id}`, veiculo);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/veiculos/${id}`);
  },

  toggleStatus: async (id: string): Promise<Veiculo> => {
    const { data } = await api.patch(`/veiculos/${id}/toggle-status`);
    return data;
  },
};

// RESERVAS
export const reservasApi = {
  list: async (): Promise<Reserva[]> => {
    const { data } = await api.get('/reservas');
    return data.data;
  },

  minhas: async (): Promise<Reserva[]> => {
    const { data } = await api.get('/reservas/minhas');
    return data.data;
  },

  create: async (reserva: Partial<Reserva>): Promise<Reserva> => {
    const { data } = await api.post('/reservas', reserva);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/reservas/${id}`);
  },
};

// DASHBOARD
export const dashboardApi = {
  getVeiculos: async (): Promise<Veiculo[]> => {
    const { data } = await api.get('/dashboard/veiculos');
    return data;
  },
};

// DISPOSITIVOS
export interface Dispositivo {
  id: string;
  identificador: string;
  descricao: string | null;
  veiculo_id: string | null;
  ativo: boolean;
  veiculo_nome?: string;
  veiculo_placa?: string;
}

export const dispositivosApi = {
  list: async (): Promise<Dispositivo[]> => {
    const { data } = await api.get('/dispositivos');
    return data.data;
  },

  getById: async (id: string): Promise<Dispositivo> => {
    const { data } = await api.get(`/dispositivos/${id}`);
    return data;
  },

  create: async (dispositivo: Partial<Dispositivo>): Promise<Dispositivo> => {
    const { data } = await api.post('/dispositivos', dispositivo);
    return data;
  },

  update: async (id: string, dispositivo: Partial<Dispositivo>): Promise<Dispositivo> => {
    const { data } = await api.put(`/dispositivos/${id}`, dispositivo);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/dispositivos/${id}`);
  },

  vincular: async (id: string, veiculoId: string): Promise<Dispositivo> => {
    const { data } = await api.patch(`/dispositivos/${id}/vincular`, { veiculo_id: veiculoId });
    return data;
  },

  desvincular: async (id: string): Promise<Dispositivo> => {
    const { data } = await api.patch(`/dispositivos/${id}/desvincular`);
    return data;
  },
};

// USUÁRIOS
export const usuariosApi = {
  list: async (): Promise<User[]> => {
    const { data } = await api.get('/usuarios');
    return data.data;
  },

  getById: async (id: string): Promise<User> => {
    const { data } = await api.get(`/usuarios/${id}`);
    return data;
  },

  create: async (usuario: Partial<User> & { senha: string }): Promise<User> => {
    const { data } = await api.post('/usuarios', usuario);
    return data;
  },

  update: async (id: string, usuario: Partial<User>): Promise<User> => {
    const { data } = await api.put(`/usuarios/${id}`, usuario);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/usuarios/${id}`);
  },

  toggleStatus: async (id: string): Promise<User> => {
    const { data } = await api.patch(`/usuarios/${id}/toggle-status`);
    return data;
  },
};

export default api;