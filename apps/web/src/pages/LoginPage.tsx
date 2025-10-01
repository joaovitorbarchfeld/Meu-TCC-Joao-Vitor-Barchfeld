import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { PageWrapper, Input, Button } from '../components/ui';

const LoginPage = () => {
  const navigate = useNavigate();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { login, password });
      
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user_name', response.data.user.nome);
      localStorage.setItem('user_id', response.data.user.id);
      localStorage.setItem('user_perfil', response.data.user.perfil);

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        padding: '1rem'
      }}>
        <div style={{ 
          width: '100%',
          maxWidth: '400px',
          padding: '2rem',
          borderRadius: '1rem',
          backgroundColor: 'rgba(0, 0, 0, 0.48)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '0.5rem' }}>
              AutoCheck
            </h1>
            <p style={{ color: '#d1d5db', fontSize: '0.875rem' }}>
              Sistema de Gerenciamento de Veículos
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Input
              label="Email ou CPF"
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Digite seu email ou CPF"
              required
            />

            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              required
            />

            {error && (
              <div style={{ 
                padding: '0.75rem', 
                borderRadius: '0.5rem', 
                backgroundColor: 'rgba(239, 68, 68, 0.2)', 
                border: '1px solid rgba(239, 68, 68, 0.3)' 
              }}>
                <p style={{ color: '#fca5a5', fontSize: '0.875rem', textAlign: 'center' }}>{error}</p>
              </div>
            )}

            <Button type="submit" loading={loading}>
              Entrar
            </Button>

            <div style={{ 
              padding: '0.75rem', 
              borderRadius: '0.5rem', 
              backgroundColor: 'rgba(59, 130, 246, 0.1)', 
              border: '1px solid rgba(59, 130, 246, 0.2)' 
            }}>
              <p style={{ color: '#bfdbfe', fontSize: '0.75rem', textAlign: 'center', lineHeight: '1.5' }}>
                <strong style={{ color: '#dbeafe' }}>Credenciais de teste:</strong><br />
                admin@autocheck.com / autocheck123
              </p>
            </div>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
              AutoCheck v1.0 – João Vítor Barchfeld – 2025
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default LoginPage;