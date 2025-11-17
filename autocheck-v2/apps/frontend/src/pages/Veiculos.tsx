import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { veiculosApi } from '../services/api';
import { Car, Plus, Edit, Trash2, ArrowLeft, Search, X, Power } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Veiculo } from '../types';

export default function Veiculos() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [nome, setNome] = useState('');
  const [placa, setPlaca] = useState('');
  const [tipo, setTipo] = useState('');
  const [combustivel, setCombustivel] = useState('');
  const [corHex, setCorHex] = useState('#3b82f6');
  const [ano, setAno] = useState('');

  useEffect(() => {
    loadVeiculos();
  }, []);

  const loadVeiculos = async () => {
    try {
      const data = await veiculosApi.list();
      setVeiculos(data);
    } catch (err) {
      console.error('Erro ao carregar veículos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (veiculo: Veiculo) => {
    setNome(veiculo.nome);
    setPlaca(veiculo.placa);
    setTipo(veiculo.tipo);
    setCombustivel(veiculo.combustivel);
    setCorHex(veiculo.cor_hex);
    setAno(veiculo.ano?.toString() || '');
    setEditingId(veiculo.id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const data = {
        nome,
        placa: placa.toUpperCase(),
        tipo,
        combustivel,
        cor_hex: corHex,
        ano: ano ? parseInt(ano) : null
      };

      if (editingId) {
        await veiculosApi.update(editingId, data);
      } else {
        await veiculosApi.create(data);
      }

      setShowModal(false);
      resetForm();
      loadVeiculos();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar veículo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await veiculosApi.toggleStatus(id);
      loadVeiculos();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao alterar status');
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Deseja realmente excluir o veículo ${nome}?`)) return;

    try {
      await veiculosApi.delete(id);
      loadVeiculos();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao excluir veículo');
    }
  };

  const resetForm = () => {
    setNome('');
    setPlaca('');
    setTipo('');
    setCombustivel('');
    setCorHex('#3b82f6');
    setAno('');
    setError('');
    setEditingId(null);
  };

  const filteredVeiculos = veiculos.filter(v => 
    v.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.placa.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'disponivel': return '#16a34a';
      case 'em_uso': return '#dc2626';
      case 'sem_dispositivo': return '#f59e0b';
      case 'inativo': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'disponivel': return 'Disponível';
      case 'em_uso': return 'Em Uso';
      case 'sem_dispositivo': return 'Sem Dispositivo';
      case 'inativo': return 'Inativo';
      default: return 'Desconhecido';
    }
  };

  const isAdmin = user?.perfil === 'admin';
  const isGestor = user?.perfil === 'gestor';
  const canEdit = isAdmin || isGestor;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #071327 0%, #2C0F4D 100%)' }}>
      <header style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', color: '#fff' }}>
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>Veículos</h1>
        </div>
        {canEdit && (
          <button onClick={openCreateModal} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '500' }}>
            <Plus size={20} />
            Novo Veículo
          </button>
        )}
      </header>

      <div style={{ padding: '0 1.5rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Buscar por nome ou placa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem', color: '#fff', outline: 'none' }}
          />
        </div>
      </div>

      <main style={{ padding: '0 1.5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', color: '#fff' }}>Carregando...</div>
        ) : filteredVeiculos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.1)', borderRadius: '1rem' }}>
            <Car size={48} color="#fff" style={{ margin: '0 auto' }} />
            <p style={{ color: '#fff', marginTop: '1rem', fontSize: '1.125rem' }}>Nenhum veículo encontrado</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {filteredVeiculos.map(veiculo => (
              <div key={veiculo.id} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '1rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
                <div style={{ height: '120px', background: veiculo.cor_hex, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <Car size={48} color="rgba(255,255,255,0.8)" strokeWidth={1.5} />
                  <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', padding: '0.25rem 0.75rem', background: 'rgba(0,0,0,0.6)', borderRadius: '9999px', fontSize: '0.75rem', color: '#fff', fontWeight: '500' }}>
                    {getStatusText(veiculo.status)}
                  </div>
                </div>

                <div style={{ padding: '1.25rem' }}>
                  <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>{veiculo.nome}</h3>
                  <p style={{ color: '#d1d5db', fontFamily: 'monospace', fontSize: '0.875rem', margin: '0 0 1rem 0' }}>{veiculo.placa}</p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div>
                      <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: '0 0 0.25rem 0' }}>Tipo</p>
                      <p style={{ color: '#fff', fontSize: '0.875rem', fontWeight: '500', margin: 0, textTransform: 'capitalize' }}>{veiculo.tipo}</p>
                    </div>
                    <div>
                      <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: '0 0 0.25rem 0' }}>Combustível</p>
                      <p style={{ color: '#fff', fontSize: '0.875rem', fontWeight: '500', margin: 0, textTransform: 'capitalize' }}>{veiculo.combustivel}</p>
                    </div>
                    {veiculo.ano && (
                      <div>
                        <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: '0 0 0.25rem 0' }}>Ano</p>
                        <p style={{ color: '#fff', fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>{veiculo.ano}</p>
                      </div>
                    )}
                    <div>
                      <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: '0 0 0.25rem 0' }}>Status</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '9999px', background: getStatusColor(veiculo.status) }} />
                        <p style={{ color: '#fff', fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>{veiculo.ativo ? 'Ativo' : 'Inativo'}</p>
                      </div>
                    </div>
                  </div>

                  {canEdit ? (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button onClick={() => handleToggleStatus(veiculo.id)} style={{ padding: '0.5rem', background: veiculo.ativo ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)', color: veiculo.ativo ? '#ef4444' : '#22c55e', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }} title={veiculo.ativo ? 'Desativar' : 'Ativar'}>
                        <Power size={16} />
                      </button>
                      <button onClick={() => openEditModal(veiculo)} style={{ flex: 1, padding: '0.5rem', background: 'rgba(59,130,246,0.2)', color: '#3b82f6', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '500' }}>
                        <Edit size={16} />
                        Editar
                      </button>
                      {isAdmin && (
                        <button onClick={() => handleDelete(veiculo.id, veiculo.nome)} style={{ padding: '0.5rem 1rem', background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ) : (
                    user?.perfil === 'colaborador' && veiculo.status === 'disponivel' && (
                      <button onClick={() => navigate('/reservas')} style={{ width: '100%', padding: '0.75rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '500', marginTop: '1rem' }}>
                        Reservar
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }} onClick={() => { setShowModal(false); resetForm(); }}>
          <div style={{ background: '#1e293b', borderRadius: '1rem', maxWidth: '500px', width: '100%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{editingId ? 'Editar Veículo' : 'Novo Veículo'}</h2>
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
                <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Nome</label>
                <input type="text" value={nome} onChange={e => setNome(e.target.value)} required style={{ width: '100%', padding: '0.75rem', background: '#334155', color: '#fff', border: '1px solid #475569', borderRadius: '0.5rem' }} placeholder="Ex: Civic Preto" />
              </div>

              <div>
                <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Placa</label>
                <input type="text" value={placa} onChange={e => setPlaca(e.target.value.toUpperCase())} required maxLength={8} style={{ width: '100%', padding: '0.75rem', background: '#334155', color: '#fff', border: '1px solid #475569', borderRadius: '0.5rem', fontFamily: 'monospace' }} placeholder="ABC-1234" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Tipo</label>
                  <select value={tipo} onChange={e => setTipo(e.target.value)} required style={{ width: '100%', padding: '0.75rem', background: '#334155', color: '#fff', border: '1px solid #475569', borderRadius: '0.5rem' }}>
                    <option value="">Selecione</option>
                    <option value="sedan">Sedan</option>
                    <option value="hatch">Hatch</option>
                    <option value="suv">SUV</option>
                    <option value="pickup">Pickup</option>
                    <option value="van">Van</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Combustível</label>
                  <select value={combustivel} onChange={e => setCombustivel(e.target.value)} required style={{ width: '100%', padding: '0.75rem', background: '#334155', color: '#fff', border: '1px solid #475569', borderRadius: '0.5rem' }}>
                    <option value="">Selecione</option>
                    <option value="gasolina">Gasolina</option>
                    <option value="etanol">Etanol</option>
                    <option value="flex">Flex</option>
                    <option value="diesel">Diesel</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Cor</label>
                  <input type="color" value={corHex} onChange={e => setCorHex(e.target.value)} style={{ width: '100%', height: '42px', background: '#334155', border: '1px solid #475569', borderRadius: '0.5rem', cursor: 'pointer' }} />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Ano (opcional)</label>
                  <input type="number" value={ano} onChange={e => setAno(e.target.value)} min="1900" max="2099" style={{ width: '100%', padding: '0.75rem', background: '#334155', color: '#fff', border: '1px solid #475569', borderRadius: '0.5rem' }} placeholder="2024" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} style={{ flex: 1, padding: '0.75rem', background: '#475569', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '500' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: '0.75rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '500', opacity: isSubmitting ? 0.5 : 1 }}>
                  {isSubmitting ? 'Salvando...' : editingId ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}