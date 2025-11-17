import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dashboardApi } from '../services/api';
import { Bell, Settings, Car, Users, FileText, Calendar, Cpu, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Veiculo } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [vehicles, setVehicles] = useState<Veiculo[]>([]);

  useEffect(() => {
    dashboardApi.getVeiculos()
      .then(setVehicles)
      .catch(console.error);
  }, []);

  const modules = [
    { id: 1, name: 'Veículos', icon: Car, route: '/veiculos' },
    { id: 2, name: 'Usuários', icon: Users, route: '/usuarios' },
    { id: 3, name: 'Relatórios', icon: FileText, route: '/relatorios' },
    { id: 4, name: 'Agenda', icon: Calendar, route: '/reservas' },
    { id: 5, name: 'Dispositivos', icon: Cpu, route: '/dispositivos' }
  ];

  const getStatusInfo = (status?: string) => {
    const map: Record<string, { color: string; text: string }> = {
      'disponivel': { color: '#16a34a', text: 'Disponível' },
      'em_uso': { color: '#dc2626', text: 'Em uso' },
      'sem_dispositivo': { color: '#f59e0b', text: 'Sem dispositivo' },
      'inativo': { color: '#6b7280', text: 'Inativo' }
    };
    return map[status || 'inativo'] || map.inativo;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #071327 0%, #2C0F4D 100%)' }}>
      {/* Header */}
      <header style={{ position: 'relative', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>AutoCheck v2</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button style={{ padding: '0.5rem', color: '#ffffff', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '0.5rem', position: 'relative' }}>
            <Bell size={16} color="#ffffff" />
            <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: '#ffffff', fontSize: '10px', borderRadius: '9999px', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
          </button>
          <button onClick={logout} style={{ padding: '0.5rem', color: '#ffffff', background: 'transparent', border: 'none', cursor: 'pointer' }} title="Sair">
            <LogOut size={16} color="#ffffff" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '32px', height: '32px', background: '#2563eb', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: '500' }}>
                {user?.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <span style={{ color: '#ffffff', fontWeight: '500' }}>{user?.nome}</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ position: 'relative', paddingBottom: '5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '60px auto', paddingRight: '340px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 100px)', gap: '20px', width: '580px' }}>
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => navigate(module.route)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100px',
                  height: '100px'
                }}
              >
                <div style={{
                  width: '70px',
                  height: '70px',
                  background: 'rgba(0,0,0,0.6)',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <module.icon size={42} color="#fff" strokeWidth={1.5} />
                </div>
                <span style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#d1d5db',
                  fontWeight: '500',
                  textAlign: 'center'
                }}>
                  {module.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ position: 'fixed', zIndex: 30, width: '340px', right: '-40px', top: 'min(10vh, 96px)', bottom: 'min(10vh, 96px)', background: 'rgba(0,0,0,0.6)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ height: '100%', overflowY: 'auto', padding: '1rem' }}>
            <h3 style={{ color: '#ffffff', fontWeight: '600', marginBottom: '1rem', fontSize: '1rem' }}>Veículos</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {vehicles.map(v => {
                const info = getStatusInfo(v.status);
                return (
                  <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}>
                    <div style={{ padding: '8px', borderRadius: '8px', background: v.cor_hex + '20', flexShrink: 0 }}>
                      <Car size={20} style={{ color: v.cor_hex }} strokeWidth={2} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#ffffff', fontWeight: '500', fontSize: '14px' }}>{v.nome}</span>
                        <span style={{ color: '#9ca3af', fontSize: '12px' }}>{v.placa}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '9999px', background: info.color }} />
                        <span style={{ color: '#d1d5db', fontSize: '12px' }}>{info.text}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40, padding: '12px', background: 'rgba(0,0,0,0.6)', textAlign: 'center' }}>
        <p style={{ color: '#ffffff', fontSize: '14px', margin: 0 }}>AutoCheck v2 – João Vítor Barchfeld – SETREM 2025</p>
      </footer>
    </div>
  );
}