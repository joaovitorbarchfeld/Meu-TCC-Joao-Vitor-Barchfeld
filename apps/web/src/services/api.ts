import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de requisição - adiciona token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de resposta - detecta token expirado
api.interceptors.response.use(
  (response) => {
    // Se a resposta for bem-sucedida, apenas retorna
    return response;
  },
  (error) => {
    // Se o erro for 401 (Unauthorized)
    if (error.response?.status === 401) {
      // Limpa o localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_name');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_perfil');
      
      // Redireciona para login
      window.location.href = '/login';
    }
    
    // Retorna o erro para ser tratado onde a requisição foi feita
    return Promise.reject(error);
  }
);