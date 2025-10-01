// apps/web/src/pages/ReservasPage.tsx

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Edit2, Trash2, Calendar, Clock, Car as CarIcon, User } from 'lucide-react';
import { api } from '../services/api';

interface Reserva {
  id: string;
  veiculo_id: string;
  user_id: string;
  start_at: string;
  end_at: string;
  note?: string;
  canceled_at?: string;
  veiculo?: {
    nome: string;
    placa: string;
    cor_hex: string;
  };
  usuario?: {
    nome: string;
  };
}

interface Veiculo {
  id: string;
  nome: string;
  placa: string;
  cor_hex: string;
}

interface Usuario {
  id: string;
  nome: string;
  email: string;
}

const ReservasPage = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReserva, setEditingReserva] = useState<Reserva | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    veiculo_id: '',
    user_id: '',
    start_date: '',
    start_time: '08:00',
    end_date: '',
    end_time: '09:00',
    note: ''
  });

  const weekDays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  const hours = Array.from({ length: 17 }, (_, i) => i + 6); // 6 to 22

  useEffect(() => {
    loadData();
  }, [currentWeekStart]);

  const loadData = async () => {
    setLoading(true);
    try {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const [reservasRes, veiculosRes, usuariosRes] = await Promise.all([
        api.get('/reservas', {
          params: {
            start: currentWeekStart.toISOString(),
            end: weekEnd.toISOString()
          }
        }),
        api.get('/veiculos'),
        api.get('/usuarios')
      ]);

      setReservas(reservasRes.data);
      setVeiculos(veiculosRes.data);
      setUsuarios(usuariosRes.data);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const previousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const nextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const getWeekRange = () => {
    const start = formatDate(currentWeekStart);
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 6);
    return `${start} - ${formatDate(end)}`;
  };

  const handleCellClick = (date: Date, hour: number) => {
    const clickDate = new Date(date);
    clickDate.setHours(hour, 0, 0, 0);

    const endDate = new Date(clickDate);
    endDate.setHours(hour + 1, 0, 0, 0);

    setFormData({
      veiculo_id: '',
      user_id: localStorage.getItem('user_id') || '',
      start_date: clickDate.toISOString().split('T')[0],
      start_time: clickDate.toTimeString().substring(0, 5),
      end_date: endDate.toISOString().split('T')[0],
      end_time: endDate.toTimeString().substring(0, 5),
      note: ''
    });
    setEditingReserva(null);
    setShowModal(true);
  };

  const handleReservaClick = (reserva: Reserva) => {
    const startDate = new Date(reserva.start_at);
    const endDate = new Date(reserva.end_at);

    setFormData({
      veiculo_id: reserva.veiculo_id,
      user_id: reserva.user_id,
      start_date: startDate.toISOString().split('T')[0],
      start_time: startDate.toTimeString().substring(0, 5),
      end_date: endDate.toISOString().split('T')[0],
      end_time: endDate.toTimeString().substring(0, 5),
      note: reserva.note || ''
    });
    setEditingReserva(reserva);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const start_at = new Date(`${formData.start_date}T${formData.start_time}:00`).toISOString();
      const end_at = new Date(`${formData.end_date}T${formData.end_time}:00`).toISOString();

      if (new Date(end_at) <= new Date(start_at)) {
        setError('Horário de término deve ser maior que o de início');
        return;
      }

      const payload = {
        veiculo_id: formData.veiculo_id,
        user_id: formData.user_id,
        start_at,
        end_at,
        note: formData.note || undefined
      };

      if (editingReserva) {
        await api.put(`/reservas/${editingReserva.id}`, payload);
        setSuccess('Reserva atualizada com sucesso!');
      } else {
        await api.post('/reservas', payload);
        setSuccess('Reserva criada com sucesso!');
      }

      setTimeout(() => {
        setShowModal(false);
        setSuccess('');
        loadData();
      }, 1500);
    } catch (err: any) {
      if (err.response?.data?.code === 'OVERLAP') {
        setError('Este horário já está reservado para este veículo');
      } else {
        setError(err.response?.data?.message || 'Erro ao salvar reserva');
      }
    }
  };

  const handleDelete = async () => {
    if (!editingReserva) return;
    if (!confirm('Deseja realmente excluir esta reserva?')) return;

    try {
      await api.delete(`/reservas/${editingReserva.id}`);
      setSuccess('Reserva excluída com sucesso!');
      setTimeout(() => {
        setShowModal(false);
        setSuccess('');
        loadData();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao excluir reserva');
    }
  };

  const getReservasForCell = (date: Date, hour: number) => {
    return reservas.filter(r => {
      const start = new Date(r.start_at);
      const end = new Date(r.end_at);
      const cellStart = new Date(date);
      cellStart.setHours(hour, 0, 0, 0);
      const cellEnd = new Date(date);
      cellEnd.setHours(hour + 1, 0, 0, 0);

      return (
        date.toDateString() === start.toDateString() &&
        start < cellEnd &&
        end > cellStart
      );
    });
  };

  const getReservaStyle = (reserva: Reserva, date: Date) => {
    const start = new Date(reserva.start_at);
    const end = new Date(reserva.end_at);
    
    const dayStart = new Date(date);
    dayStart.setHours(6, 0, 0, 0);
    
    const startMinutes = (start.getTime() - dayStart.getTime()) / (1000 * 60);
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    
    const top = (startMinutes / 60) * 56;
    const height = (durationMinutes / 60) * 56 - 2;

    return {
      position: 'absolute' as const,
      top: `${top}px`,
      height: `${height}px`,
      left: '4px',
      right: '4px',
      background: reserva.veiculo?.cor_hex || '#4A90E2',
      borderRadius: '4px',
      padding: '4px 8px',
      fontSize: '11px',
      color: '#ffffff',
      overflow: 'hidden',
      cursor: 'pointer',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      zIndex: 1
    };
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #071327 0%, #2C0F4D 100%)', color: '#ffffff' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: rgba(255, 255, 255, 0.5) !important; }
        select option { background: #1a1a2e !important; color: #ffffff !important; }
        input, select, textarea { color: #ffffff !important; }
      `}</style>

      {/* Header */}
      <header style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => window.history.back()}
            style={{ width: '40px', height: '40px', background: 'rgba(255, 255, 255, 0.1)', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ChevronLeft size={20} color="#ffffff" />
          </button>
          <Calendar size={24} color="#ffffff" />
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff' }}>Reservas</h1>
        </div>
        <button
          onClick={() => {
            setFormData({
              veiculo_id: '',
              user_id: localStorage.getItem('user_id') || '',
              start_date: new Date().toISOString().split('T')[0],
              start_time: '08:00',
              end_date: new Date().toISOString().split('T')[0],
              end_time: '09:00',
              note: ''
            });
            setEditingReserva(null);
            setShowModal(true);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
        >
          <Plus size={16} />
          Nova Reserva
        </button>
      </header>

      {/* Week Navigation */}
      <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <button onClick={previousWeek} style={{ padding: '8px 16px', background: 'rgba(255, 255, 255, 0.1)', border: 'none', borderRadius: '8px', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ChevronLeft size={16} />
          Anterior
        </button>
        <span style={{ fontSize: '16px', fontWeight: '500', color: '#ffffff' }}>{getWeekRange()}</span>
        <button onClick={nextWeek} style={{ padding: '8px 16px', background: 'rgba(255, 255, 255, 0.1)', border: 'none', borderRadius: '8px', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          Próxima
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div style={{ padding: '0 24px 80px', overflow: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', gap: '1px', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', overflow: 'hidden' }}>
          {/* Header Row */}
          <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '12px', textAlign: 'center', fontWeight: '600', color: '#ffffff' }}>Horário</div>
          {getWeekDays().map((date, i) => (
            <div
              key={i}
              style={{
                background: isToday(date) ? 'rgba(139, 92, 246, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                padding: '12px',
                textAlign: 'center',
                fontWeight: '600',
                color: '#ffffff'
              }}
            >
              <div>{weekDays[i]}</div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>{formatDate(date)}</div>
            </div>
          ))}

          {/* Time Rows */}
          {hours.map(hour => (
            <div key={hour} style={{ display: 'contents' }}>
              <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '8px', textAlign: 'center', fontSize: '12px', color: '#ffffff' }}>
                {hour.toString().padStart(2, '0')}:00
              </div>
              {getWeekDays().map((date, i) => {
                const cellReservas = getReservasForCell(date, hour);
                return (
                  <div
                    key={i}
                    onClick={() => handleCellClick(date, hour)}
                    style={{
                      background: 'rgba(0, 0, 0, 0.2)',
                      minHeight: '56px',
                      position: 'relative',
                      cursor: 'pointer',
                      borderLeft: i === 0 ? 'none' : '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    {cellReservas.map(reserva => (
                      <div
                        key={reserva.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReservaClick(reserva);
                        }}
                        style={getReservaStyle(reserva, date)}
                      >
                        <div style={{ fontWeight: '600', fontSize: '11px' }}>
                          {new Date(reserva.start_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div style={{ fontSize: '10px', opacity: 0.9 }}>
                          {reserva.veiculo?.nome} - {reserva.veiculo?.placa}
                        </div>
                        <div style={{ fontSize: '10px', opacity: 0.8 }}>
                          {reserva.usuario?.nome}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'rgba(0, 0, 0, 0.9)', borderRadius: '12px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflow: 'auto', border: '1px solid rgba(255, 255, 255, 0.1)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff' }}>
                {editingReserva ? 'Editar Reserva' : 'Nova Reserva'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#ffffff" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
              {error && (
                <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', marginBottom: '16px' }}>
                  <p style={{ color: '#fca5a5', fontSize: '14px' }}>{error}</p>
                </div>
              )}

              {success && (
                <div style={{ padding: '12px', background: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', marginBottom: '16px' }}>
                  <p style={{ color: '#86efac', fontSize: '14px' }}>{success}</p>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Veículo *</label>
                  <select
                    value={formData.veiculo_id}
                    onChange={(e) => setFormData({ ...formData, veiculo_id: e.target.value })}
                    required
                    style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.48)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '14px' }}
                  >
                    <option value="">Selecione um veículo</option>
                    {veiculos.map(v => (
                      <option key={v.id} value={v.id}>{v.nome} - {v.placa}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Condutor *</label>
                  <select
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    required
                    style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.48)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '14px' }}
                  >
                    <option value="">Selecione um condutor</option>
                    {usuarios.map(u => (
                      <option key={u.id} value={u.id}>{u.nome} - {u.email}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Data Início *</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                      style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.48)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '14px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Hora *</label>
                    <input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      required
                      style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.48)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '14px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Data Término *</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      required
                      style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.48)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '14px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Hora *</label>
                    <input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      required
                      style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.48)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '14px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Observações</label>
                  <textarea
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    rows={3}
                    placeholder="Observações sobre a reserva..."
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.48)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '14px', resize: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  {editingReserva && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      style={{ flex: 1, padding: '12px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#fca5a5', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                      Excluir
                    </button>
                  )}
                  <button
                    type="submit"
                    style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    {editingReserva ? 'Atualizar' : 'Criar'} Reserva
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px', background: 'rgba(0, 0, 0, 0.6)', textAlign: 'center' }}>
        <p style={{ color: '#ffffff', fontSize: '14px', margin: 0 }}>AutoCheck – v1.0 – João Vítor Barchfeld – 2025</p>
      </footer>
    </div>
  );
};

export default ReservasPage;