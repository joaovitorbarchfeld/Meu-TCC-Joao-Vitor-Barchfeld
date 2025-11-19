import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usuariosApi } from '../services/api';
import { Users, Plus, Edit, Trash2, ArrowLeft, Search, Shield, ShieldCheck, UserCog, Power, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types';

export default function Usuarios() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [perfil, setPerfil] = useState<'colaborador' | 'gestor' | 'admin'>('colaborador');

  if (user?.perfil === 'colaborador') {
    navigate('/dashboard');
    return null;
  }

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      const data = await usuariosApi.list();
      setUsuarios(data);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (usuario: User) => {
    setNome(usuario.nome);
    setEmail(usuario.email);
    setPerfil(usuario.perfil);
    setPassword('');
    setEditingId(usuario.id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const data: any = { nome, email, perfil };

      if (editingId) {
        if (password) data.password = password;
        await usuariosApi.update(editingId, data);
      } else {
        if (!password) {
          setError('Senha é obrigatória ao criar usuário');
          setIsSubmitting(false);
          return;
        }
        data.password = password;
        await usuariosApi.create(data);
      }

      setShowModal(false);
      resetForm();
      loadUsuarios();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar usuário');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await usuariosApi.toggleStatus(id);
      loadUsuarios();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao alterar status');
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Deseja realmente excluir o usuário ${nome}?`)) return;
    try {
      await usuariosApi.delete(id);
      loadUsuarios();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao excluir usuário');
    }
  };

  const resetForm = () => {
    setNome('');
    setEmail('');
    setPassword('');
    setPerfil('colaborador');
    setError('');
    setEditingId(null);
  };

  const filteredUsuarios = usuarios.filter(u => 
    u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPerfilIcon = (perfil: string) => {
    switch (perfil) {
      case 'admin': return <ShieldCheck size={18} color="#ef4444" />;
      case 'gestor': return <Shield size={18} color="#f59e0b" />;
      default: return <UserCog size={18} color="#3b82f6" />;
    }
  };

  const getPerfilColor = (perfil: string) => {
    switch (perfil) {
      case 'admin': return 'rgba(239,68,68,0.2)';
      case 'gestor': return 'rgba(245,158,11,0.2)';
      default: return 'rgba(59,130,246,0.2)';
    }
  };

  const getPerfilTextColor = (perfil: string) => {
    switch (perfil) {
      case 'admin': return '#ef4444';
      case 'gestor': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #071327 0%, #2C0F4D 100%)' }}>
      <header style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', color: '#fff' }}><ArrowLeft size={20} /></button>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>Usuários</h1>
        </div>
        {user?.perfil === 'admin' && (
          <button onClick={openCreateModal} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '500' }}><Plus size={20} />Novo Usuário</button>
        )}
      </header>

      <div style={{ padding: '0 1.5rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input type="text" placeholder="Buscar por nome ou email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem', color: '#fff', outline: 'none' }} />
        </div>
      </div>

      <main style={{ padding: '0 1.5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', color: '#fff' }}>Carregando...</div>
        ) : filteredUsuarios.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.1)', borderRadius: '1rem' }}><Users size={48} color="#fff" style={{ margin: '0 auto' }} /><p style={{ color: '#fff', marginTop: '1rem', fontSize: '1.125rem' }}>Nenhum usuário encontrado</p></div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {filteredUsuarios.map(usuario => (
              <div key={usuario.id} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                      <div style={{ width: '48px', height: '48px', background: 'rgba(59,130,246,0.2)', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#3b82f6', fontSize: '1.25rem', fontWeight: '600' }}>{usuario.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}</span></div>
                      <div><h3 style={{ color: '#fff', fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>{usuario.nome}</h3><p style={{ color: '#d1d5db', fontSize: '0.875rem', margin: 0 }}>{usuario.email}</p></div>
                    </div>
                    <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                      <div><p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: '0 0 0.25rem 0' }}>Perfil</p><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.75rem', background: getPerfilColor(usuario.perfil), borderRadius: '9999px' }}>{getPerfilIcon(usuario.perfil)}<span style={{ color: getPerfilTextColor(usuario.perfil), fontSize: '0.875rem', fontWeight: '500', textTransform: 'capitalize' }}>{usuario.perfil}</span></div></div>
                      <div><p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: '0 0 0.25rem 0' }}>Status</p><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '8px', height: '8px', borderRadius: '9999px', background: usuario.ativo ? '#16a34a' : '#6b7280' }} /><span style={{ color: '#fff', fontSize: '0.875rem', fontWeight: '500' }}>{usuario.ativo ? 'Ativo' : 'Inativo'}</span></div></div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {user?.perfil === 'admin' && usuario.id !== user.id && (<><button onClick={() => handleToggleStatus(usuario.id)} style={{ padding: '0.5rem', background: usuario.ativo ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)', color: usuario.ativo ? '#ef4444' : '#22c55e', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }} title={usuario.ativo ? 'Desativar' : 'Ativar'}><Power size={18} /></button><button onClick={() => openEditModal(usuario)} style={{ padding: '0.5rem', background: 'rgba(59,130,246,0.2)', color: '#3b82f6', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}><Edit size={18} /></button><button onClick={() => handleDelete(usuario.id, usuario.nome)} style={{ padding: '0.5rem', background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}><Trash2 size={18} /></button></>)}
                    {usuario.id === user?.id && (<span style={{ padding: '0.5rem 1rem', background: 'rgba(59,130,246,0.2)', color: '#3b82f6', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Você</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }} onClick={() => { setShowModal(false); resetForm(); }}>
          <div style={{ background: '#1e293b', borderRadius: '1rem', maxWidth: '500px', width: '100%', padding: '2rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}><h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{editingId ? 'Editar Usuário' : 'Novo Usuário'}</h2><button onClick={() => { setShowModal(false); resetForm(); }} style={{ padding: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={24} /></button></div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {error && (<div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '0.5rem', fontSize: '0.875rem' }}>{error}</div>)}
              <div><label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Nome Completo</label><input type="text" value={nome} onChange={e => setNome(e.target.value)} required style={{ width: '100%', padding: '0.75rem', background: '#334155', color: '#fff', border: '1px solid #475569', borderRadius: '0.5rem' }} placeholder="João Silva" /></div>
              <div><label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '0.75rem', background: '#334155', color: '#fff', border: '1px solid #475569', borderRadius: '0.5rem' }} placeholder="joao@empresa.com" /></div>
              <div><label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Senha {editingId && '(deixe em branco para manter)'}</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required={!editingId} style={{ width: '100%', padding: '0.75rem', background: '#334155', color: '#fff', border: '1px solid #475569', borderRadius: '0.5rem' }} placeholder="••••••••" /></div>
              <div><label style={{ display: 'block', color: '#d1d5db', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Perfil</label><select value={perfil} onChange={e => setPerfil(e.target.value as any)} required style={{ width: '100%', padding: '0.75rem', background: '#334155', color: '#fff', border: '1px solid #475569', borderRadius: '0.5rem' }}><option value="colaborador">Colaborador</option><option value="gestor">Gestor</option><option value="admin">Administrador</option></select></div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}><button type="button" onClick={() => { setShowModal(false); resetForm(); }} style={{ flex: 1, padding: '0.75rem', background: '#475569', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '500' }}>Cancelar</button><button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: '0.75rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '500', opacity: isSubmitting ? 0.5 : 1 }}>{isSubmitting ? 'Salvando...' : editingId ? 'Salvar' : 'Criar'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}