import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { reservasApi, veiculosApi } from '../services/api';
import { Calendar, Clock, Car, User, X, Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Reserva, Veiculo } from '../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Reservas() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [veiculoId, setVeiculoId] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [motivo, setMotivo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reservasData, veiculosData] = await Promise.all([
        reservasApi.minhas(),
        veiculosApi.list()
      ]);
      setReservas(reservasData);
      setVeiculos(veiculosData.filter(v => v.ativo));
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await reservasApi.create({
        veiculo_id: veiculoId,
        start_at: startAt,
        end_at: endAt,
        motivo
      });

      setShowModal(false);
      resetForm();
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar reserva');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja cancelar esta reserva?')) return;

    try {
      await reservasApi.delete(id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao cancelar reserva');
    }
  };

  const resetForm = () => {
    setVeiculoId('');
    setStartAt('');
    setEndAt('');
    setMotivo('');
    setError('');
  };

  const getStatusColor = (reserva: Reserva) => {
    const now = new Date();
    const start = parseISO(reserva.start_at);
    const end = parseISO(reserva.end_at);

    if (end < now) return 'bg-gray-100 text-gray-600';
    if (start <= now && end >= now) return 'bg-green-100 text-green-700';
    return 'bg-blue-100 text-blue-700';
  };

  const getStatusText = (reserva: Reserva) => {
    const now = new Date();
    const start = parseISO(reserva.start_at);
    const end = parseISO(reserva.end_at);

    if (end < now) return 'Finalizada';
    if (start <= now && end >= now) return 'Em andamento';
    return 'Agendada';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #071327 0%, #2C0F4D 100%)' }}>
      {/* Header */}
      <header style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', color: '#fff' }}>
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>Minhas Reservas</h1>
        </div>
        <button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '500' }}>
          <Plus size={20} />
          Nova Reserva
        </button>
      </header>

      {/* Content */}
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', color: '#fff' }}>Carregando...</div>
        ) : reservas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.1)', borderRadius: '1rem' }}>
            <Calendar size={48} color="#fff" style={{ margin: '0 auto' }} />
            <p style={{ color: '#fff', marginTop: '1rem', fontSize: '1.125rem' }}>Nenhuma reserva encontrada</p>
            <p style={{ color: '#d1d5db', marginTop: '0.5rem' }}>Clique em "Nova Reserva" para agendar um veículo</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {reservas.map(reserva => (
              <div key={reserva.id} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <Car size={24} color="#fff" />
                      <div>
                        <h3 style={{ color: '#fff', fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>{reserva.veiculo_nome}</h3>
                        <p style={{ color: '#d1d5db', fontSize: '0.875rem', margin: 0 }}>{reserva.veiculo_placa}</p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                      <div>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>Início</p>
                        <p style={{ color: '#fff', fontWeight: '500', margin: 0 }}>{format(parseISO(reserva.start_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                      </div>
                      <div>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>Fim</p>
                        <p style={{ color: '#fff', fontWeight: '500', margin: 0 }}>{format(parseISO(reserva.end_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                      </div>
                    </div>

                    {reserva.motivo && (
                      <div style={{ marginTop: '1rem' }}>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>Motivo</p>
                        <p style={{ color: '#fff', margin: 0 }}>{reserva.motivo}</p>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '500' }} className={getStatusColor(reserva)}>
                      {getStatusText(reserva)}
                    </span>
                    {new Date(reserva.start_at) > new Date() && (
                      <button onClick={() => handleDelete(reserva.id)} style={{ padding: '0.5rem', background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
                        <X size={20} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }} onClick={() => setShowModal(false)}>
          <div style={{ background: '#1e293b', borderRadius: '1rem', maxWidth: '500px', width: '100%', padding: '2rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Nova Reserva</h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} style={{ padding: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {error && (
                <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                  {error}
                </div>
              )}

              <div>
                <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Veículo</label>
                <select value={veiculoId} onChange={e => setVeiculoId(e.target.value)} required style={{ width: '100%', padding: '0.75rem', background: '#334155', color: '#fff', border: '1px solid #475569', borderRadius: '0.5rem' }}>
                  <option value="">Selecione um veículo</option>
                  {veiculos.filter(v => v.status === 'disponivel').map(v => (
                    <option key={v.id} value={v.id}>{v.nome} - {v.placa}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Data/Hora Início</label>
                  <input type="datetime-local" value={startAt} onChange={e => setStartAt(e.target.value)} required style={{ width: '100%', padding: '0.75rem', background: '#334155', color: '#fff', border: '1px solid #475569', borderRadius: '0.5rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Data/Hora Fim</label>
                  <input type="datetime-local" value={endAt} onChange={e => setEndAt(e.target.value)} required style={{ width: '100%', padding: '0.75rem', background: '#334155', color: '#fff', border: '1px solid #475569', borderRadius: '0.5rem' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Motivo (opcional)</label>
                <textarea value={motivo} onChange={e => setMotivo(e.target.value)} rows={3} style={{ width: '100%', padding: '0.75rem', background: '#334155', color: '#fff', border: '1px solid #475569', borderRadius: '0.5rem', resize: 'vertical' }} placeholder="Descreva o motivo da reserva..." />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} style={{ flex: 1, padding: '0.75rem', background: '#475569', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '500' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: '0.75rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '500', opacity: isSubmitting ? 0.5 : 1 }}>
                  {isSubmitting ? 'Criando...' : 'Criar Reserva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}