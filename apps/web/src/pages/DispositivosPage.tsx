// apps/web/src/pages/DispositivosPage.tsx

import { useState, useEffect } from 'react';
import { ChevronLeft, Plus, X, Edit2, Cpu, Search, Wifi, WifiOff, Link2, Unlink, Activity, TestTube } from 'lucide-react';
import { api } from '../services/api';

interface Dispositivo {
  id: string;
  serial: string;
  modelo: string;
  status: 'conectado' | 'offline' | 'nunca_pareado';
  last_seen?: string;
  veiculo_id?: string;
  veiculo?: {
    nome: string;
    placa: string;
    cor_hex: string;
  };
  acelerometro: boolean;
  giroscopio: boolean;
  magnetometro: boolean;
  barometro: boolean;
  created_at: string;
  updated_at: string;
}

interface Veiculo {
  id: string;
  nome: string;
  placa: string;
  cor_hex: string;
}

const DispositivosPage = () => {
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSensorModal, setShowSensorModal] = useState(false);
  const [showVinculoModal, setShowVinculoModal] = useState(false);
  const [editingDispositivo, setEditingDispositivo] = useState<Dispositivo | null>(null);
  const [testingDispositivo, setTestingDispositivo] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ ok: boolean; latency_ms?: number; error?: string } | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [vinculoFilter, setVinculoFilter] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    serial: '',
    modelo: 'ESP32-WROOM-32'
  });

  const [sensoresData, setSensoresData] = useState({
    acelerometro: false,
    giroscopio: false,
    magnetometro: false,
    barometro: false
  });

  const [vinculoData, setVinculoData] = useState({
    veiculo_id: ''
  });

  useEffect(() => {
    loadData();
  }, [searchQuery, statusFilter, vinculoFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchQuery) params.q = searchQuery;
      if (statusFilter) params.status = statusFilter;
      if (vinculoFilter) params.vinculo = vinculoFilter;

      const [dispositivosRes, veiculosRes] = await Promise.all([
        api.get('/dispositivos', { params }),
        api.get('/veiculos')
      ]);

      setDispositivos(dispositivosRes.data);
      setVeiculos(veiculosRes.data);
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormData({
      serial: '',
      modelo: 'ESP32-WROOM-32'
    });
    setEditingDispositivo(null);
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const openEditModal = (dispositivo: Dispositivo) => {
    setFormData({
      serial: dispositivo.serial,
      modelo: dispositivo.modelo
    });
    setEditingDispositivo(dispositivo);
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const openSensorModal = (dispositivo: Dispositivo) => {
    setSensoresData({
      acelerometro: dispositivo.acelerometro,
      giroscopio: dispositivo.giroscopio,
      magnetometro: dispositivo.magnetometro,
      barometro: dispositivo.barometro
    });
    setEditingDispositivo(dispositivo);
    setShowSensorModal(true);
    setError('');
    setSuccess('');
  };

  const openVinculoModal = (dispositivo: Dispositivo) => {
    setVinculoData({
      veiculo_id: dispositivo.veiculo_id || ''
    });
    setEditingDispositivo(dispositivo);
    setShowVinculoModal(true);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingDispositivo) {
        await api.put(`/dispositivos/${editingDispositivo.id}`, formData);
        setSuccess('Dispositivo atualizado com sucesso!');
      } else {
        await api.post('/dispositivos', formData);
        setSuccess('Dispositivo criado com sucesso!');
      }

      setTimeout(() => {
        setShowModal(false);
        setSuccess('');
        loadData();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar dispositivo');
    }
  };

  const handleSensorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDispositivo) return;

    setError('');
    setSuccess('');

    try {
      await api.patch(`/dispositivos/${editingDispositivo.id}/sensores`, sensoresData);
      setSuccess('Sensores atualizados com sucesso!');

      setTimeout(() => {
        setShowSensorModal(false);
        setSuccess('');
        loadData();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar sensores');
    }
  };

  const handleVinculoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDispositivo) return;

    setError('');
    setSuccess('');

    try {
      await api.patch(`/dispositivos/${editingDispositivo.id}/vinculo`, {
        veiculo_id: vinculoData.veiculo_id || null
      });
      setSuccess(vinculoData.veiculo_id ? 'Dispositivo vinculado com sucesso!' : 'Dispositivo desvinculado com sucesso!');

      setTimeout(() => {
        setShowVinculoModal(false);
        setSuccess('');
        loadData();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao vincular dispositivo');
    }
  };

  const handleTestar = async (dispositivoId: string) => {
    setTestingDispositivo(dispositivoId);
    setTestResult(null);

    try {
      const response = await api.post(`/dispositivos/${dispositivoId}/testar`);
      setTestResult(response.data);
    } catch (err: any) {
      setTestResult({ ok: false, error: err.response?.data?.message || 'Erro ao testar comunicação' });
    } finally {
      setTestingDispositivo(null);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setVinculoFilter('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'conectado': return '#10b981';
      case 'offline': return '#ef4444';
      case 'nunca_pareado': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'conectado': return 'Conectado';
      case 'offline': return 'Offline';
      case 'nunca_pareado': return 'Nunca Pareado';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'conectado': return <Wifi size={16} color="#10b981" />;
      case 'offline': return <WifiOff size={16} color="#ef4444" />;
      case 'nunca_pareado': return <WifiOff size={16} color="#6b7280" />;
      default: return <WifiOff size={16} color="#6b7280" />;
    }
  };

  const formatLastSeen = (lastSeen?: string) => {
    if (!lastSeen) return 'Nunca';
    const date = new Date(lastSeen);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}min atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
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
          <button
            onClick={() => window.history.back()}
            style={{ width: '40px', height: '40px', background: 'rgba(255, 255, 255, 0.1)', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ChevronLeft size={20} color="#ffffff" />
          </button>
          <Cpu size={24} color="#ffffff" />
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff' }}>Dispositivos ESP32</h1>
        </div>
        <button
          onClick={openCreateModal}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
        >
          <Plus size={16} />
          Novo Dispositivo
        </button>
      </header>

      {/* Busca e Filtros */}
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {/* Busca */}
          <div style={{ flex: '1', minWidth: '250px', position: 'relative' }}>
            <Search size={18} color="rgba(255, 255, 255, 0.5)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Buscar por serial ou placa do veículo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', height: '44px', padding: '0 12px 0 40px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.48)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '14px' }}
            />
          </div>

          {/* Filtro Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ height: '44px', padding: '0 32px 0 12px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.48)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '14px', appearance: 'none', cursor: 'pointer' }}
          >
            <option value="">Todos os status</option>
            <option value="conectado">Conectado</option>
            <option value="offline">Offline</option>
            <option value="nunca_pareado">Nunca Pareado</option>
          </select>

          {/* Filtro Vínculo */}
          <select
            value={vinculoFilter}
            onChange={(e) => setVinculoFilter(e.target.value)}
            style={{ height: '44px', padding: '0 32px 0 12px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.48)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '14px', appearance: 'none', cursor: 'pointer' }}
          >
            <option value="">Todos</option>
            <option value="vinculados">Vinculados</option>
            <option value="livres">Livres</option>
          </select>

          {/* Limpar */}
          {(searchQuery || statusFilter || vinculoFilter) && (
            <button
              onClick={clearFilters}
              style={{ padding: '0 16px', height: '44px', background: 'rgba(255, 255, 255, 0.1)', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '14px', cursor: 'pointer' }}
            >
              Limpar
            </button>
          )}
        </div>

        {/* Contador */}
        <div style={{ marginBottom: '16px' }}>
          <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: '500' }}>
            {dispositivos.length} dispositivo(s) encontrado(s)
          </span>
        </div>

        {/* Loading */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#ffffff' }}>Carregando...</div>
        ) : (
          /* Grid de Cards */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
            {dispositivos.map((dispositivo) => (
              <div
                key={dispositivo.id}
                style={{
                  background: 'rgba(0, 0, 0, 0.48)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                {/* Header do Card */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Cpu size={24} color="#ffffff" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ color: '#ffffff', fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                        {dispositivo.serial}
                      </h3>
                      <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                        {dispositivo.modelo}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {getStatusIcon(dispositivo.status)}
                  </div>
                </div>

                {/* Status */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  background: `${getStatusColor(dispositivo.status)}20`,
                  color: getStatusColor(dispositivo.status),
                  border: `1px solid ${getStatusColor(dispositivo.status)}40`,
                  alignSelf: 'flex-start'
                }}>
                  {getStatusLabel(dispositivo.status)}
                </div>

                {/* Veículo vinculado */}
                {dispositivo.veiculo ? (
                  <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <Link2 size={14} color="rgba(255, 255, 255, 0.6)" />
                      <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)', fontWeight: '600' }}>VINCULADO A:</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: dispositivo.veiculo.cor_hex + '40', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: dispositivo.veiculo.cor_hex }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', color: '#ffffff', fontWeight: '500' }}>{dispositivo.veiculo.nome}</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)' }}>{dispositivo.veiculo.placa}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Unlink size={14} color="#fca5a5" />
                      <span style={{ fontSize: '12px', color: '#fca5a5' }}>Não vinculado</span>
                    </div>
                  </div>
                )}

                {/* Sensores GY-91 */}
                <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)', fontWeight: '600', marginBottom: '8px' }}>SENSORES GY-91:</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: dispositivo.acelerometro ? '#10b981' : '#6b7280' }} />
                      <span style={{ color: dispositivo.acelerometro ? '#10b981' : 'rgba(255, 255, 255, 0.4)' }}>Acelerômetro</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: dispositivo.giroscopio ? '#10b981' : '#6b7280' }} />
                      <span style={{ color: dispositivo.giroscopio ? '#10b981' : 'rgba(255, 255, 255, 0.4)' }}>Giroscópio</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: dispositivo.magnetometro ? '#10b981' : '#6b7280' }} />
                      <span style={{ color: dispositivo.magnetometro ? '#10b981' : 'rgba(255, 255, 255, 0.4)' }}>Magnetômetro</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: dispositivo.barometro ? '#10b981' : '#6b7280' }} />
                      <span style={{ color: dispositivo.barometro ? '#10b981' : 'rgba(255, 255, 255, 0.4)' }}>Barômetro</span>
                    </div>
                  </div>
                </div>

                {/* Last Seen */}
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
                  Última comunicação: <span style={{ color: '#ffffff', fontWeight: '500' }}>{formatLastSeen(dispositivo.last_seen)}</span>
                </div>

                {/* Teste de comunicação */}
                {testResult && testingDispositivo === dispositivo.id && (
                  <div style={{
                    padding: '10px',
                    borderRadius: '6px',
                    background: testResult.ok ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: testResult.ok ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                    fontSize: '12px',
                    color: testResult.ok ? '#86efac' : '#fca5a5'
                  }}>
                    {testResult.ok ? `✓ Comunicação OK (${testResult.latency_ms}ms)` : `✗ ${testResult.error}`}
                  </div>
                )}

                {/* Ações */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <button
                    onClick={() => openVinculoModal(dispositivo)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    {dispositivo.veiculo_id ? <Unlink size={14} /> : <Link2 size={14} />}
                    {dispositivo.veiculo_id ? 'Desvincular' : 'Vincular'}
                  </button>
                  <button
                    onClick={() => openSensorModal(dispositivo)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    <Activity size={14} />
                    Sensores
                  </button>
                  <button
                    onClick={() => handleTestar(dispositivo.id)}
                    disabled={testingDispositivo === dispositivo.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px',
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '6px',
                      color: '#93c5fd',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: testingDispositivo === dispositivo.id ? 'not-allowed' : 'pointer',
                      opacity: testingDispositivo === dispositivo.id ? 0.5 : 1
                    }}
                  >
                    <TestTube size={14} />
                    {testingDispositivo === dispositivo.id ? 'Testando...' : 'Testar'}
                  </button>
                  <button
                    onClick={() => openEditModal(dispositivo)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    <Edit2 size={14} />
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && dispositivos.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.6)' }}>
            Nenhum dispositivo encontrado
          </div>
        )}
      </div>

      {/* Modal Criar/Editar */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'rgba(0, 0, 0, 0.9)', borderRadius: '12px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflow: 'auto', border: '1px solid rgba(255, 255, 255, 0.1)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff' }}>
                {editingDispositivo ? 'Editar Dispositivo' : 'Novo Dispositivo'}
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
                {/* Serial */}
                <div>
                  <label style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Serial *</label>
                  <input
                    type="text"
                    value={formData.serial}
                    onChange={(e) => setFormData({ ...formData, serial: e.target.value })}
                    required
                    disabled={!!editingDispositivo}
                    style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.48)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '14px', opacity: editingDispositivo ? 0.6 : 1, cursor: editingDispositivo ? 'not-allowed' : 'text' }}
                  />
                  {editingDispositivo && (
                    <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '4px' }}>Serial não pode ser alterado</p>
                  )}
                </div>

                {/* Modelo */}
                <div>
                  <label style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Modelo *</label>
                  <select
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    required
                    style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.48)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '14px' }}
                  >
                    <option value="ESP32-WROOM-32">ESP32-WROOM-32</option>
                    <option value="ESP32-WROOM-32D">ESP32-WROOM-32D</option>
                    <option value="ESP32-WROOM-32U">ESP32-WROOM-32U</option>
                  </select>
                </div>

                {/* Botões */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{ flex: 1, padding: '12px', background: 'rgba(255, 255, 255, 0.1)', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    {editingDispositivo ? 'Atualizar' : 'Criar'} Dispositivo
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sensores */}
      {showSensorModal && editingDispositivo && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }} onClick={() => setShowSensorModal(false)}>
          <div style={{ background: 'rgba(0, 0, 0, 0.9)', borderRadius: '12px', maxWidth: '500px', width: '100%', border: '1px solid rgba(255, 255, 255, 0.1)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff' }}>Configurar Sensores GY-91</h2>
              <button onClick={() => setShowSensorModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#ffffff" />
              </button>
            </div>

            <form onSubmit={handleSensorSubmit} style={{ padding: '20px' }}>
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '8px' }}>
                  Selecione quais sensores estão ativos no módulo GY-91:
                </p>

                {/* Acelerômetro */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={sensoresData.acelerometro}
                    onChange={(e) => setSensoresData({ ...sensoresData, acelerometro: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: '500' }}>Acelerômetro</div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>Mede aceleração (ax, ay, az)</div>
                  </div>
                </label>

                {/* Giroscópio */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={sensoresData.giroscopio}
                    onChange={(e) => setSensoresData({ ...sensoresData, giroscopio: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: '500' }}>Giroscópio</div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>Mede rotação (gx, gy, gz)</div>
                  </div>
                </label>

                {/* Magnetômetro */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={sensoresData.magnetometro}
                    onChange={(e) => setSensoresData({ ...sensoresData, magnetometro: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: '500' }}>Magnetômetro</div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>Mede campo magnético (mx, my, mz)</div>
                  </div>
                </label>

                {/* Barômetro */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={sensoresData.barometro}
                    onChange={(e) => setSensoresData({ ...sensoresData, barometro: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: '500' }}>Barômetro</div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>Mede pressão atmosférica</div>
                  </div>
                </label>

                {/* Botões */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => setShowSensorModal(false)}
                    style={{ flex: 1, padding: '12px', background: 'rgba(255, 255, 255, 0.1)', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Salvar Sensores
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Vínculo */}
      {showVinculoModal && editingDispositivo && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }} onClick={() => setShowVinculoModal(false)}>
          <div style={{ background: 'rgba(0, 0, 0, 0.9)', borderRadius: '12px', maxWidth: '500px', width: '100%', border: '1px solid rgba(255, 255, 255, 0.1)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff' }}>
                {editingDispositivo.veiculo_id ? 'Desvincular Dispositivo' : 'Vincular Dispositivo'}
              </h2>
              <button onClick={() => setShowVinculoModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#ffffff" />
              </button>
            </div>

            <form onSubmit={handleVinculoSubmit} style={{ padding: '20px' }}>
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
                  <label style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Veículo</label>
                  <select
                    value={vinculoData.veiculo_id}
                    onChange={(e) => setVinculoData({ veiculo_id: e.target.value })}
                    style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.48)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '14px' }}
                  >
                    <option value="">Nenhum (desvincular)</option>
                    {veiculos.map(v => (
                      <option key={v.id} value={v.id}>{v.nome} - {v.placa}</option>
                    ))}
                  </select>
                  <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '8px' }}>
                    {vinculoData.veiculo_id ? 'O dispositivo será vinculado ao veículo selecionado' : 'Deixe vazio para desvincular o dispositivo'}
                  </p>
                </div>

                {/* Botões */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setShowVinculoModal(false)}
                    style={{ flex: 1, padding: '12px', background: 'rgba(255, 255, 255, 0.1)', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    {vinculoData.veiculo_id ? 'Vincular' : 'Desvincular'}
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

export default DispositivosPage;