import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dispositivosApi, veiculosApi } from '../services/api';
import { Cpu, Plus, Edit, Trash2, ArrowLeft, Search, Link, Unlink, X, Power } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Dispositivo } from '../services/api';
import type { Veiculo } from '../types';

export default function Dispositivos() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showVincularModal, setShowVincularModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [vinculandoId, setVinculandoId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [identificador, setIdentificador] = useState('');
  const [descricao, setDescricao] = useState('');
  const [veiculoId, setVeiculoId] = useState('');

  if (user?.perfil !== 'admin') {
    navigate('/dashboard');
    return null;
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dispositivosData, veiculosData] = await Promise.all([
        dispositivosApi.list(),
        veiculosApi.list()
      ]);
      setDispositivos(dispositivosData);
      setVeiculos(veiculosData.filter(v => v.ativo));
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (dispositivo: Dispositivo) => {
    setIdentificador(dispositivo.identificador);
    setDescricao(dispositivo.descricao || '');
    setEditingId(dispositivo.id);
    setShowModal(true);
  };

  const openVincularModal = (id: string) => {
    setVinculandoId(id);
    setVeiculoId('');
    setShowVincularModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const data = {
        identificador,
        descricao: descricao || null,
        ativo: true
      };

      if (editingId) {
        await dispositivosApi.update(editingId, data);
      } else {
        await dispositivosApi.create(data);
      }

      setShowModal(false);
      resetForm();
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar dispositivo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVincular = async () => {
    if (!veiculoId || !vinculandoId) return;
    setIsSubmitting(true);

    try {
      await dispositivosApi.vincular(vinculandoId, veiculoId);
      setShowVincularModal(false);
      setVinculandoId(null);
      setVeiculoId('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao vincular dispositivo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDesvincular = async (id: string, identificador: string) => {
    if (!confirm(`Deseja desvincular o dispositivo ${identificador}?`)) return;

    try {
      await dispositivosApi.desvincular(id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao desvincular dispositivo');
    }
  };

  const handleDelete = async (id: string, identificador: string) => {
    if (!confirm(`Deseja realmente excluir o dispositivo ${identificador}?`)) return;

    try {
      await dispositivosApi.delete(id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao excluir dispositivo');
    }
  };

  const resetForm = () => {
    setIdentificador('');
    setDescricao('');
    setError('');
    setEditingId(null);
  };

  const filteredDispositivos = dispositivos.filter(d => 
    d.identificador.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const veiculosDisponiveis = veiculos.filter(v => !dispositivos.some(d => d.veiculo_id === v.id && d.ativo));

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #071327 0%, #2C0F4D 100%)' }}>
      <header style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', color: '#fff' }}><ArrowLeft size={20} /></button>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>Dispositivos ESP32</h1>
        </div>
        <button onClick={openCreateModal} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '500' }}><Plus size={20} />Novo Dispositivo</button>
      </header>

      <div style={{ padding: '0 1.5rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input type="text" placeholder="Buscar por identificador ou descrição..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem', color: '#fff', outline: 'none' }} />
        </div>
      </div>

      <main style={{ padding: '0 1.5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', color: '#fff' }}>Carregando...</div>
        ) : filteredDispositivos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.1)', borderRadius: '1rem' }}><Cpu size={48} color="#fff" style={{ margin: '0 auto' }} /><p style={{ color: '#fff', marginTop: '1rem', fontSize: '1.125rem' }}>Nenhum dispositivo encontrado</p></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
            {filteredDispositivos.map(dispositivo => (
              <div key={dispositivo.id} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ padding: '0.75rem', background: 'rgba(59,130,246,0.2)', borderRadius: '0.75rem' }}><Cpu size={24} color="#3b82f6" /></div>
                    <div><h3 style={{ color: '#fff', fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>{dispositivo.identificador}</h3><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}><div style={{ width: '8px', height: '8px', borderRadius: '9999px', background: dispositivo.ativo ? '#16a34a' : '#6b7280' }} /><span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{dispositivo.ativo ? 'Ativo' : 'Inativo'}</span></div></div>
                  </div>
                </div>

                {dispositivo.descricao && (<p style={{ color: '#d1d5db', fontSize: '0.875rem', margin: '0 0 1rem 0' }}>{dispositivo.descricao}</p>)}

                <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                  <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: '0 0 0.5rem 0' }}>Veículo Vinculado</p>
                  {dispositivo.veiculo_id ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div><p style={{ color: '#fff', fontWeight: '500', margin: 0 }}>{dispositivo.veiculo_nome}</p><p style={{ color: '#d1d5db', fontSize: '0.875rem', fontFamily: 'monospace', margin: 0 }}>{dispositivo.veiculo_placa}</p></div>
                      <button onClick={() => handleDesvincular(dispositivo.id, dispositivo.identificador)} style={{ padding: '0.5rem', background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }} title="Desvincular"><Unlink size={18} /></button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>Nenhum veículo vinculado</p>
                      <button onClick={() => openVincularModal(dispositivo.id)} style={{ padding: '0.5rem', background: 'rgba(34,197,94,0.2)', color: '#22c55e', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }} title="Vincular"><Link size={18} /></button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => openEditModal(dispositivo)} style={{ flex: 1, padding: '0.5rem', background: 'rgba(59,130,246,0.2)', color: '#3b82f6', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '500' }}><Edit size={16} />Editar</button>
                  <button onClick={() => handleDelete(dispositivo.id, dispositivo.identificador)} style={{ padding: '0.5rem 1rem', background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }} onClick={() => { setShowModal(false); resetForm(); }}>
          <div style={{ background: '#1e293b', borderRadius: '1rem', maxWidth: '500px', width: '100%', padding: '2rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}><h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{editingId ? 'Editar Dispositivo' : 'Novo Dispositivo'}</h2><button onClick={() => { setShowModal(false); resetForm(); }} style={{ padding: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={24} /></button></div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {error && (<div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '0.5rem', fontSize: '0.875rem' }}>{error}</div>)}
              <div><label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Identificador</label><input type="text" value={identificador} onChange={e => setIdentificador(e.target.value)} required style={{ width: '100%', padding: '0.75rem', background: '#334155', color: '#fff', border: '1px solid #475569', borderRadius: '0.5rem' }} placeholder="ESP32-001" /></div>
              <div><label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Descrição (opcional)</label><textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={3} style={{ width: '100%', padding: '0.75rem', background: '#334155', color: '#fff', border: '1px solid #475569', borderRadius: '0.5rem', resize: 'vertical' }} placeholder="Localização ou descrição do dispositivo..." /></div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}><button type="button" onClick={() => { setShowModal(false); resetForm(); }} style={{ flex: 1, padding: '0.75rem', background: '#475569', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '500' }}>Cancelar</button><button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: '0.75rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '500', opacity: isSubmitting ? 0.5 : 1 }}>{isSubmitting ? 'Salvando...' : editingId ? 'Salvar' : 'Criar'}</button></div>
            </form>
          </div>
        </div>
      )}

      {showVincularModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }} onClick={() => { setShowVincularModal(false); setVinculandoId(null); setVeiculoId(''); }}>
          <div style={{ background: '#1e293b', borderRadius: '1rem', maxWidth: '500px', width: '100%', padding: '2rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}><h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Vincular Veículo</h2><button onClick={() => { setShowVincularModal(false); setVinculandoId(null); setVeiculoId(''); }} style={{ padding: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={24} /></button></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Selecione o veículo</label><select value={veiculoId} onChange={e => setVeiculoId(e.target.value)} required style={{ width: '100%', padding: '0.75rem', background: '#334155', color: '#fff', border: '1px solid #475569', borderRadius: '0.5rem' }}><option value="">Selecione um veículo</option>{veiculosDisponiveis.map(v => (<option key={v.id} value={v.id}>{v.nome} - {v.placa}</option>))}</select></div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}><button type="button" onClick={() => { setShowVincularModal(false); setVinculandoId(null); setVeiculoId(''); }} style={{ flex: 1, padding: '0.75rem', background: '#475569', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '500' }}>Cancelar</button><button onClick={handleVincular} disabled={isSubmitting || !veiculoId} style={{ flex: 1, padding: '0.75rem', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '500', opacity: (isSubmitting || !veiculoId) ? 0.5 : 1 }}>{isSubmitting ? 'Vinculando...' : 'Vincular'}</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}