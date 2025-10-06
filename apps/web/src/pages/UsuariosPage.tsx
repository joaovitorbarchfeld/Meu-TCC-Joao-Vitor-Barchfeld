// apps/web/src/pages/UsuariosPage.tsx

import { useState, useEffect } from 'react';
import { ChevronLeft, Plus, X, Edit2, Trash2, User, Search, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../services/api';

interface Usuario {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  cnh_numero?: string;
  cnh_categoria?: string;
  cnh_validade?: string;
  perfil: 'colaborador' | 'gestor' | 'admin';
  cargo?: string;
  observacao?: string;
  ativo: boolean;
}

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [perfilFilter, setPerfilFilter] = useState('');
  const [ativoFilter, setAtivoFilter] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cnh_numero: '',
    cnh_categoria: '',
    cnh_validade: '',
    perfil: 'colaborador' as 'colaborador' | 'gestor' | 'admin',
    cargo: '',
    observacao: '',
    ativo: true
  });

  useEffect(() => {
    loadUsuarios();
  }, [searchQuery, perfilFilter, ativoFilter]);

  const loadUsuarios = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchQuery) params.q = searchQuery;
      if (perfilFilter) params.perfil = perfilFilter;
      if (ativoFilter) params.ativo = ativoFilter;

      const response = await api.get('/usuarios', { params });
      setUsuarios(response.data);
    } catch (err: any) {
      console.error('Erro ao carregar usuários:', err);
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      cnh_numero: '',
      cnh_categoria: '',
      cnh_validade: '',
      perfil: 'colaborador',
      cargo: '',
      observacao: '',
      ativo: true
    });
    setEditingUsuario(null);
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const openEditModal = (usuario: Usuario) => {
    setFormData({
      nome: usuario.nome,
      email: usuario.email || '',
      telefone: usuario.telefone || '',
      cnh_numero: usuario.cnh_numero || '',
      cnh_categoria: usuario.cnh_categoria || '',
      cnh_validade: usuario.cnh_validade || '',
      perfil: usuario.perfil,
      cargo: usuario.cargo || '',
      observacao: usuario.observacao || '',
      ativo: usuario.ativo
    });
    setEditingUsuario(usuario);
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...formData,
        email: formData.email || undefined,
        telefone: formData.telefone || undefined,
        cnh_numero: formData.cnh_numero || undefined,
        cnh_categoria: formData.cnh_categoria || undefined,
        cnh_validade: formData.cnh_validade || undefined,
        cargo: formData.cargo || undefined,
        observacao: formData.observacao || undefined
      };

      if (editingUsuario) {
        await api.put(`/usuarios/${editingUsuario.id}`, payload);
        setSuccess('Usuário atualizado com sucesso!');
      } else {
        await api.post('/usuarios', payload);
        setSuccess('Usuário criado com sucesso!');
      }

      setTimeout(() => {
        setShowModal(false);
        setSuccess('');
        loadUsuarios();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar usuário');
    }
  };

  const handleDelete = async () => {
    if (!editingUsuario) return;
    if (!confirm(`Deseja realmente excluir o usuário "${editingUsuario.nome}"?`)) return;

    try {
      await api.delete(`/usuarios/${editingUsuario.id}`);
      setSuccess('Usuário excluído com sucesso!');
      setTimeout(() => {
        setShowModal(false);
        setSuccess('');
        loadUsuarios();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao excluir usuário');
    }
  };

  const toggleActive = async (usuario: Usuario) => {
    try {
      await api.patch(`/usuarios/${usuario.id}/ativo`);
      loadUsuarios();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao alterar status');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPerfilFilter('');
    setAtivoFilter('');
  };

  const getPerfilColor = (perfil: string) => {
    switch (perfil) {
      case 'admin': return '#ef4444';
      case 'gestor': return '#f59e0b';
      case 'colaborador': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPerfilLabel = (perfil: string) => {
    switch (perfil) {
      case 'admin': return 'Administrador';
      case 'gestor': return 'Gestor';
      case 'colaborador': return 'Colaborador';
      default: return perfil;
    }
  };

  const filteredUsuarios = usuarios;

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
          <User size={24} color="#ffffff" />
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff' }}>Usuários</h1>
        </div>
        <button
          onClick={openCreateModal}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
        >
          <Plus size={16} />
          Novo Usuário
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
              placeholder="Buscar por nome ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', height: '44px', padding: '0 12px 0 40px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.48)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '14px' }}
            />
          </div>

          {/* Filtro Perfil */}
          <select
            value={perfilFilter}
            onChange={(e) => setPerfilFilter(e.target.value)}
            style={{ height: '44px', padding: '0 32px 0 12px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.48)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '14px', appearance: 'none', cursor: 'pointer' }}
          >
            <option value="">Todos os perfis</option>
            <option value="colaborador">Colaborador</option>
            <option value="gestor">Gestor</option>
            <option value="admin">Administrador</option>
          </select>

          {/* Filtro Status */}
          <select
            value={ativoFilter}
            onChange={(e) => setAtivoFilter(e.target.value)}
            style={{ height: '44px', padding: '0 32px 0 12px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.48)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '14px', appearance: 'none', cursor: 'pointer' }}
          >
            <option value="">Todos os status</option>
            <option value="true">Ativos</option>
            <option value="false">Inativos</option>
          </select>

          {/* Limpar */}
          {(searchQuery || perfilFilter || ativoFilter) && (
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
            {filteredUsuarios.length} usuário(s) encontrado(s)
          </span>
        </div>

        {/* Loading */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#ffffff' }}>Carregando...</div>
        ) : (
          /* Grid de Cards */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {filteredUsuarios.map((usuario) => (
              <div
                key={usuario.id}
                style={{
                  background: 'rgba(0, 0, 0, 0.48)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {/* Header do Card */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <span style={{ color: '#ffffff', fontSize: '18px', fontWeight: '600' }}>
                        {usuario.nome.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ color: '#ffffff', fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                        {usuario.nome}
                      </h3>
                      <div style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: `${getPerfilColor(usuario.perfil)}20`,
                        color: getPerfilColor(usuario.perfil),
                        border: `1px solid ${getPerfilColor(usuario.perfil)}40`
                      }}>
                        {getPerfilLabel(usuario.perfil)}
                      </div>
                    </div>
                  </div>
                  {usuario.ativo ? (
                    <CheckCircle size={20} color="#10b981" />
                  ) : (
                    <XCircle size={20} color="#ef4444" />
                  )}
                </div>

                {/* Informações */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  {usuario.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Email:</span>
                      <span style={{ color: '#ffffff' }}>{usuario.email}</span>
                    </div>
                  )}
                  {usuario.telefone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Telefone:</span>
                      <span style={{ color: '#ffffff' }}>{usuario.telefone}</span>
                    </div>
                  )}
                  {usuario.cargo && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Cargo:</span>
                      <span style={{ color: '#ffffff' }}>{usuario.cargo}</span>
                    </div>
                  )}
                  {usuario.cnh_numero && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>CNH:</span>
                      <span style={{ color: '#ffffff' }}>{usuario.cnh_numero} ({usuario.cnh_categoria})</span>
                    </div>
                  )}
                </div>

                {/* Ações */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <button
                    onClick={() => openEditModal(usuario)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    <Edit2 size={14} />
                    Editar
                  </button>
                  <button
                    onClick={() => toggleActive(usuario)}
                    style={{
                      padding: '10px 16px',
                      background: usuario.ativo ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                      border: usuario.ativo ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)',
                      borderRadius: '6px',
                      color: usuario.ativo ? '#fca5a5' : '#86efac',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    {usuario.ativo ? 'Inativar' : 'Ativar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredUsuarios.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.6)' }}>
            Nenhum usuário encontrado
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'rgba(0, 0, 0, 0.9)', borderRadius: '12px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflow: 'auto', border: '1px solid rgba(255, 255, 255, 0.1)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff' }}>
                {editingUsuario ? 'Editar Usuário' : 'Novo Usuário'}
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
                {/* Nome */}
                <div>
                  <label style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Nome Completo *</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                    style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.48)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '14px' }}
                  />
                </div>

                {/* Email e Telefone */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.48)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '14px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Telefone</label>
                    <input
                      type="text"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.48)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '14px' }}
                    />
                  </div>
                </div>

                {/* Perfil e Cargo */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Perfil *</label>
                    <select
                      value={formData.perfil}
                      onChange={(e) => setFormData({ ...formData, perfil: e.target.value as any })}
                      required
                      style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.48)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '14px' }}
                    >
                      <option value="colaborador">Colaborador</option>
                      <option value="gestor">Gestor</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Cargo</label>
                    <input
                      type="text"
                      value={formData.cargo}
                      onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                      style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.48)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '14px' }}
                    />
                  </div>
                </div>

                {/* CNH */}
                <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <label style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>CNH (Opcional)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', marginBottom: '6px' }}>Número</label>
                      <input
                        type="text"
                        value={formData.cnh_numero}
                        onChange={(e) => setFormData({ ...formData, cnh_numero: e.target.value })}
                        style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '6px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#ffffff', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', marginBottom: '6px' }}>Categoria</label>
                      <select
                        value={formData.cnh_categoria}
                        onChange={(e) => setFormData({ ...formData, cnh_categoria: e.target.value })}
                        style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '6px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#ffffff', fontSize: '13px' }}
                      >
                        <option value="">-</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                        <option value="E">E</option>
                        <option value="AB">AB</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', marginBottom: '6px' }}>Validade</label>
                      <input
                        type="date"
                        value={formData.cnh_validade}
                        onChange={(e) => setFormData({ ...formData, cnh_validade: e.target.value })}
                        style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '6px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#ffffff', fontSize: '13px' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <label style={{ display: 'block', color: '#ffffff', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Observações</label>
                  <textarea
                    value={formData.observacao}
                    onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                    rows={3}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.48)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '14px', resize: 'none' }}
                  />
                </div>

                {/* Ativo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="checkbox"
                    id="ativo"
                    checked={formData.ativo}
                    onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="ativo" style={{ color: '#ffffff', fontSize: '14px', cursor: 'pointer' }}>
                    Usuário ativo
                  </label>
                </div>

                {/* Botões */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  {editingUsuario && (
                    <button
                    type="button"
                      onClick={handleDelete}
                      style={{ flex: 1, padding: '12px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#fca5a5', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <Trash2 size={16} />
                      Excluir
                    </button>
                  )}
                  <button
                    type="submit"
                    style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    {editingUsuario ? 'Atualizar' : 'Criar'} Usuário
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

export default UsuariosPage;