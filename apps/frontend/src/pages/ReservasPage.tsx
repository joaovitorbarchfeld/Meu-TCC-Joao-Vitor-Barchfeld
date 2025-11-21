import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, X, Trash2, Edit2, Save } from 'lucide-react';
import api from '../services/api';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
}

interface Veiculo {
  id: string;
  nome: string;
  placa: string;
  cor_hex: string;
  ativo: boolean;
}

interface Reserva {
  id: string;
  veiculo_id: string;
  user_id: string;
  start_at: string;
  end_at: string;
  note?: string;
  canceled_at?: string;
}

const ReservasPage = () => {
  // Estados
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    veiculo_id: '',
    user_id: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    note: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Controle de semana
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadData();
  }, [currentWeekStart]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      // Carregar reservas, veículos e usuários em paralelo
      const [reservasRes, veiculosRes, usuariosRes] = await Promise.all([
        api.get('/v1/reservas', {
          params: {
            start: currentWeekStart.toISOString(),
            end: weekEnd.toISOString()
          }
        }),
        api.get('/v1/veiculos'),
        api.get('/v1/usuarios')
      ]);

      setReservas(reservasRes.data.data || reservasRes.data || []);
      setVeiculos((veiculosRes.data.data || veiculosRes.data || []).filter((v: Veiculo) => v.ativo));
      setUsuarios((usuariosRes.data.data || usuariosRes.data || []).filter((u: Usuario) => u.ativo));
      
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      setError(err.response?.data?.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validações
    if (!formData.veiculo_id) {
      setError('Selecione um veículo');
      return;
    }
    
    if (!formData.user_id) {
      setError('Selecione o usuário responsável');
      return;
    }

    if (!formData.start_date || !formData.start_time || !formData.end_date || !formData.end_time) {
      setError('Preencha todos os campos de data e hora');
      return;
    }

    try {
      // Montar timestamps ISO 8601
      const start_at = `${formData.start_date}T${formData.start_time}:00.000Z`;
      const end_at = `${formData.end_date}T${formData.end_time}:00.000Z`;

      const payload = {
        veiculo_id: formData.veiculo_id,
        user_id: formData.user_id,
        start_at,
        end_at,
        note: formData.note || undefined
      };

      if (editingId) {
        // Editar reserva existente
        await api.put(`/v1/reservas/${editingId}`, payload);
        setSuccess('Reserva atualizada com sucesso!');
      } else {
        // Criar nova reserva
        await api.post('/v1/reservas', payload);
        setSuccess('Reserva criada com sucesso!');
      }

      setTimeout(() => {
        setShowModal(false);
        setSuccess('');
        resetForm();
        loadData();
      }, 1500);

    } catch (err: any) {
      console.error('Erro ao salvar reserva:', err);
      
      if (err.response?.data?.code === 'OVERLAP') {
        setError('Já existe uma reserva para este veículo no período selecionado');
      } else {
        setError(err.response?.data?.message || 'Erro ao salvar reserva');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta reserva?')) return;

    try {
      await api.delete(`/v1/reservas/${id}`);
      setSuccess('Reserva excluída com sucesso!');
      setTimeout(() => {
        setSuccess('');
        loadData();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao excluir reserva');
    }
  };

  const handleEdit = (reserva: Reserva) => {
    const startDate = new Date(reserva.start_at);
    const endDate = new Date(reserva.end_at);

    setFormData({
      veiculo_id: reserva.veiculo_id,
      user_id: reserva.user_id,
      start_date: startDate.toISOString().split('T')[0],
      start_time: startDate.toTimeString().slice(0, 5),
      end_date: endDate.toISOString().split('T')[0],
      end_time: endDate.toTimeString().slice(0, 5),
      note: reserva.note || ''
    });
    setEditingId(reserva.id);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      veiculo_id: '',
      user_id: '',
      start_date: '',
      start_time: '',
      end_date: '',
      end_time: '',
      note: ''
    });
    setEditingId(null);
    setError('');
  };

  const openNewReservaModal = () => {
    resetForm();
    setShowModal(true);
  };

  const nextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };

  const prevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const formatDateRange = () => {
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 6);
    
    return `${currentWeekStart.toLocaleDateString('pt-BR')} - ${end.toLocaleDateString('pt-BR')}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #071327 0%, #2C0F4D 100%)', color: '#ffffff', paddingBottom: '80px' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder, textarea::placeholder { color: rgba(255, 255, 255, 0.5) !important; }
        select option { background: #1a1a2e !important; color: #ffffff !important; }
        input, select, textarea { color: #ffffff !important; }
      `}</style>

      {/* Header */}
      <header style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Calendar size={24} />
          <h1 style={{ fontSize: '20px', fontWeight: '600' }}>Reservas</h1>
        </div>
        
        <button
          onClick={openNewReservaModal}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
        >
          <Plus size={16} />
          Nova Reserva
        </button>
      </header>

      {/* Controles de Navegação */}
      <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={prevWeek} style={{ padding: '8px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>
          <ChevronLeft size={20} />
        </button>
        
        <h2 style={{ fontSize: '16px', fontWeight: '500' }}>{formatDateRange()}</h2>
        
        <button onClick={nextWeek} style={{ padding: '8px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Alertas */}
      {error && (
        <div style={{ margin: '0 24px 16px', padding: '12px 16px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '8px', color: '#fecaca' }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ margin: '0 24px 16px', padding: '12px 16px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.5)', borderRadius: '8px', color: '#6ee7b7' }}>
          {success}
        </div>
      )}

      {/* Lista de Reservas */}
      <div style={{ padding: '0 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.6)' }}>
            Carregando...
          </div>
        ) : reservas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.6)' }}>
            Nenhuma reserva nesta semana
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {reservas.map(reserva => {
              const veiculo = veiculos.find(v => v.id === reserva.veiculo_id);
              const usuario = usuarios.find(u => u.id === reserva.user_id);
              const startDate = new Date(reserva.start_at);
              const endDate = new Date(reserva.end_at);
              
              return (
                <div key={reserva.id} style={{ padding: '16px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: veiculo?.cor_hex || '#6b7280' }} />
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{veiculo?.nome || 'Veículo não encontrado'}</h3>
                        <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>{veiculo?.placa}</p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleEdit(reserva)} style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.2)', border: 'none', borderRadius: '6px', color: '#60a5fa', cursor: 'pointer' }}>
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(reserva.id)} style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.2)', border: 'none', borderRadius: '6px', color: '#f87171', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
                    <div>
                      <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Responsável:</span> {usuario?.nome || 'Não informado'}
                    </div>
                    <div>
                      <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Início:</span> {startDate.toLocaleString('pt-BR')}
                    </div>
                    <div>
                      <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Email:</span> {usuario?.email || 'Não informado'}
                    </div>
                    <div>
                      <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Fim:</span> {endDate.toLocaleString('pt-BR')}
                    </div>
                  </div>
                  
                  {reserva.note && (
                    <div style={{ marginTop: '12px', padding: '8px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '6px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
                      <strong>Observação:</strong> {reserva.note}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Criação/Edição */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '600px', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', borderRadius: '16px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600' }}>
                {editingId ? 'Editar Reserva' : 'Nova Reserva'}
              </h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} style={{ padding: '8px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Veículo */}
              <div>
                <label style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Veículo *
                </label>
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

              {/* Usuário Responsável */}
              <div>
                <label style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Usuário Responsável *
                </label>
                <select
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  required
                  style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.48)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '14px' }}
                >
                  <option value="">Selecione o usuário responsável</option>
                  {usuarios.map(u => (
                    <option key={u.id} value={u.id}>{u.nome} - {u.email}</option>
                  ))}
                </select>
              </div>

              {/* Data e Hora de Início */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    Data Início *
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                    style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.48)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    Hora *
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                    style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.48)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '14px' }}
                  />
                </div>
              </div>

              {/* Data e Hora de Fim */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    Data Fim *
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                    style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.48)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    Hora *
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    required
                    style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.48)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '14px' }}
                  />
                </div>
              </div>

              {/* Observações */}
              <div>
                <label style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Observações
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  rows={3}
                  placeholder="Adicione observações sobre esta reserva..."
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.48)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '14px', resize: 'vertical' }}
                />
              </div>

              {/* Botões */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="submit"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
                >
                  <Save size={16} />
                  {editingId ? 'Atualizar' : 'Salvar'}
                </button>
                
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  style={{ flex: 1, padding: '12px', background: 'rgba(255, 255, 255, 0.1)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 24px', background: 'rgba(0, 0, 0, 0.6)', borderTop: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center', fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
        AutoCheck — v2.0 — João Vítor Barchfeld — 2025
      </footer>
    </div>
  );
};

export default ReservasPage;
