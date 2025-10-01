import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Car, Filter, X, Save, Power, PowerOff, ChevronLeft } from 'lucide-react';

interface Veiculo {
  id: string;
  nome: string;
  placa: string;
  renavam?: string;
  chassi?: string;
  tipo: 'leve' | 'medio' | 'pesado' | 'moto';
  ano_modelo?: number;
  combustivel?: 'gasolina' | 'etanol' | 'diesel' | 'flex' | 'eletrico' | 'hibrido';
  odometro: number;
  consumo_medio?: number;
  cor_hex: string;
  ativo: boolean;
}

interface FormData {
  nome: string;
  placa: string;
  renavam: string;
  chassi: string;
  tipo: string;
  ano_modelo: string;
  combustivel: string;
  odometro: string;
  consumo_medio: string;
  cor_hex: string;
  ativo: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const VeiculosPage = () => {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [filtros, setFiltros] = useState({
    q: '',
    tipo: 'todos',
    combustivel: 'todos',
    ativo: 'todos'
  });
  const [showModal, setShowModal] = useState(false);
  const [editingVeiculo, setEditingVeiculo] = useState<Veiculo | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    placa: '',
    renavam: '',
    chassi: '',
    tipo: 'leve',
    ano_modelo: '',
    combustivel: 'flex',
    odometro: '0',
    consumo_medio: '',
    cor_hex: '#4A90E2',
    ativo: true
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const mockVeiculos: Veiculo[] = [
      {
        id: '1',
        nome: 'Onix LTZ',
        placa: 'BRA2A25',
        tipo: 'leve',
        ano_modelo: 2023,
        combustivel: 'flex',
        cor_hex: '#4A90E2',
        renavam: '12345678901',
        chassi: 'ABC123456789XYZ',
        odometro: 15000,
        consumo_medio: 12.5,
        ativo: true
      },
      {
        id: '2',
        nome: 'Strada Working',
        placa: 'BRX1B23',
        tipo: 'leve',
        ano_modelo: 2022,
        combustivel: 'flex',
        cor_hex: '#E24A4A',
        renavam: '98765432109',
        chassi: 'XYZ987654321ABC',
        odometro: 28000,
        consumo_medio: 10.8,
        ativo: true
      },
      {
        id: '3',
        nome: 'Ducato Cargo',
        placa: 'BRD4D56',
        tipo: 'pesado',
        ano_modelo: 2020,
        combustivel: 'diesel',
        cor_hex: '#FFFFFF',
        renavam: '66778899001',
        chassi: 'GHI666777888999',
        odometro: 78000,
        consumo_medio: 8.5,
        ativo: true
      },
      {
        id: '4',
        nome: 'Polo Comfort',
        placa: 'BRE5E67',
        tipo: 'leve',
        ano_modelo: 2024,
        combustivel: 'flex',
        cor_hex: '#34C759',
        renavam: '22334455667',
        chassi: 'JKL222333444555',
        odometro: 5000,
        consumo_medio: 14.0,
        ativo: false
      }
    ];
    setVeiculos(mockVeiculos);
  }, []);

  const veiculosFiltrados = veiculos.filter(v => {
    const matchQ = !filtros.q || 
      v.nome.toLowerCase().includes(filtros.q.toLowerCase()) ||
      v.placa.toLowerCase().includes(filtros.q.toLowerCase());
    
    const matchTipo = filtros.tipo === 'todos' || v.tipo === filtros.tipo;
    const matchCombustivel = filtros.combustivel === 'todos' || v.combustivel === filtros.combustivel;
    const matchAtivo = filtros.ativo === 'todos' || 
      (filtros.ativo === 'sim' ? v.ativo : !v.ativo);
    
    return matchQ && matchTipo && matchCombustivel && matchAtivo;
  });

  const handleOpenModal = (veiculo?: Veiculo) => {
    if (veiculo) {
      setEditingVeiculo(veiculo);
      setFormData({
        nome: veiculo.nome,
        placa: veiculo.placa,
        renavam: veiculo.renavam || '',
        chassi: veiculo.chassi || '',
        tipo: veiculo.tipo,
        ano_modelo: veiculo.ano_modelo?.toString() || '',
        combustivel: veiculo.combustivel || 'flex',
        odometro: veiculo.odometro.toString(),
        consumo_medio: veiculo.consumo_medio?.toString() || '',
        cor_hex: veiculo.cor_hex,
        ativo: veiculo.ativo
      });
    } else {
      setEditingVeiculo(null);
      setFormData({
        nome: '',
        placa: '',
        renavam: '',
        chassi: '',
        tipo: 'leve',
        ano_modelo: '',
        combustivel: 'flex',
        odometro: '0',
        consumo_medio: '',
        cor_hex: '#4A90E2',
        ativo: true
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.nome.trim()) {
      errors.nome = 'Nome é obrigatório';
    }
    
    if (!formData.placa.trim()) {
      errors.placa = 'Placa é obrigatória';
    } else if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(formData.placa.replace(/[-\s]/g, ''))) {
      errors.placa = 'Formato de placa inválido (ABC1D23 ou ABC-1D23)';
    }
    
    if (!/^#[0-9A-Fa-f]{6}$/.test(formData.cor_hex)) {
      errors.cor_hex = 'Formato de cor inválido (#000000)';
    }
    
    if (formData.chassi && formData.chassi.length !== 17) {
      errors.chassi = 'Chassi deve ter 17 caracteres';
    }
    
    if (formData.ano_modelo) {
      const ano = parseInt(formData.ano_modelo);
      const anoAtual = new Date().getFullYear();
      if (ano < 1950 || ano > anoAtual + 1) {
        errors.ano_modelo = `Ano deve estar entre 1950 e ${anoAtual + 1}`;
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    setTimeout(() => {
      const novoVeiculo: Veiculo = {
        id: editingVeiculo?.id || Date.now().toString(),
        nome: formData.nome,
        placa: formData.placa.toUpperCase().replace(/[-\s]/g, ''),
        renavam: formData.renavam || undefined,
        chassi: formData.chassi || undefined,
        tipo: formData.tipo as any,
        ano_modelo: formData.ano_modelo ? parseInt(formData.ano_modelo) : undefined,
        combustivel: formData.combustivel as any,
        odometro: parseInt(formData.odometro) || 0,
        consumo_medio: formData.consumo_medio ? parseFloat(formData.consumo_medio) : undefined,
        cor_hex: formData.cor_hex,
        ativo: formData.ativo
      };
      
      if (editingVeiculo) {
        setVeiculos(prev => prev.map(v => v.id === editingVeiculo.id ? novoVeiculo : v));
      } else {
        setVeiculos(prev => [...prev, novoVeiculo]);
      }
      
      setLoading(false);
      setShowModal(false);
    }, 500);
  };

  const handleToggleAtivo = (veiculo: Veiculo) => {
    setVeiculos(prev => prev.map(v => 
      v.id === veiculo.id ? { ...v, ativo: !v.ativo } : v
    ));
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente excluir este veículo?')) {
      setVeiculos(prev => prev.filter(v => v.id !== id));
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #071327 0%, #2C0F4D 100%)',
      paddingBottom: '80px'
    }}>
      <style>{`
        * {
          box-sizing: border-box;
        }
        input::placeholder {
          color: rgba(255, 255, 255, 0.5) !important;
        }
        select option {
          background: #1a1a2e !important;
          color: #ffffff !important;
        }
      `}</style>

      {/* Header */}
      <header style={{
        position: 'relative',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => window.history.back()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            title="Voltar"
          >
            <ChevronLeft size={24} color="#ffffff" />
          </button>
          <Car style={{ color: '#ffffff' }} size={24} />
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>Veículos</h1>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '8px',
            background: 'rgba(74, 144, 226, 0.9)',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(74, 144, 226, 1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(74, 144, 226, 0.9)'}
        >
          <Plus size={16} />
          <span>Novo Veículo</span>
        </button>
      </header>

      {/* Main Content */}
      <main style={{ padding: '0 24px' }}>
        {/* Barra de Busca e Filtros */}
        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px' }}>
          {/* Busca */}
          <div style={{ position: 'relative' }}>
            <Search style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'rgba(255, 255, 255, 0.5)',
              pointerEvents: 'none'
            }} size={18} />
            <input
              type="text"
              placeholder="Buscar por nome ou placa..."
              value={filtros.q}
              onChange={(e) => setFiltros(prev => ({ ...prev, q: e.target.value }))}
              style={{
                width: '100%',
                height: '44px',
                paddingLeft: '48px',
                paddingRight: '16px',
                color: '#ffffff',
                background: 'rgba(0, 0, 0, 0.48)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                outline: 'none',
                fontSize: '14px'
              }}
              onFocus={(e) => e.currentTarget.style.border = '1px solid rgba(74, 144, 226, 0.5)'}
              onBlur={(e) => e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.12)'}
            />
          </div>

          {/* Filtros */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter style={{ color: 'rgba(255, 255, 255, 0.6)' }} size={16} />
              <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: '500' }}>Filtros:</span>
            </div>

            <select
              value={filtros.tipo}
              onChange={(e) => setFiltros(prev => ({ ...prev, tipo: e.target.value }))}
              style={{
                height: '36px',
                padding: '0 32px 0 12px',
                color: '#ffffff',
                fontSize: '14px',
                background: 'rgba(0, 0, 0, 0.48)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23ffffff\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 10px center'
              }}
            >
              <option value="todos">Todos os tipos</option>
              <option value="leve">Leve</option>
              <option value="medio">Médio</option>
              <option value="pesado">Pesado</option>
              <option value="moto">Motocicleta</option>
            </select>

            <select
              value={filtros.combustivel}
              onChange={(e) => setFiltros(prev => ({ ...prev, combustivel: e.target.value }))}
              style={{
                height: '36px',
                padding: '0 32px 0 12px',
                color: '#ffffff',
                fontSize: '14px',
                background: 'rgba(0, 0, 0, 0.48)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23ffffff\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 10px center'
              }}
            >
              <option value="todos">Todos combustíveis</option>
              <option value="gasolina">Gasolina</option>
              <option value="etanol">Etanol</option>
              <option value="diesel">Diesel</option>
              <option value="flex">Flex</option>
              <option value="eletrico">Elétrico</option>
              <option value="hibrido">Híbrido</option>
            </select>

            <select
              value={filtros.ativo}
              onChange={(e) => setFiltros(prev => ({ ...prev, ativo: e.target.value }))}
              style={{
                height: '36px',
                padding: '0 32px 0 12px',
                color: '#ffffff',
                fontSize: '14px',
                background: 'rgba(0, 0, 0, 0.48)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23ffffff\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 10px center'
              }}
            >
              <option value="todos">Todos status</option>
              <option value="sim">Ativos</option>
              <option value="nao">Inativos</option>
            </select>

            {(filtros.tipo !== 'todos' || filtros.combustivel !== 'todos' || filtros.ativo !== 'todos') && (
              <button
                onClick={() => setFiltros({ q: filtros.q, tipo: 'todos', combustivel: 'todos', ativo: 'todos' })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '14px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
              >
                <X size={14} />
                <span>Limpar</span>
              </button>
            )}
          </div>

          <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: '500' }}>
            {veiculosFiltrados.length} {veiculosFiltrados.length === 1 ? 'veículo' : 'veículos'}
          </div>
        </div>

        {/* Lista de Veículos - Grid Responsivo */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
          width: '100%'
        }}>
          {veiculosFiltrados.map(veiculo => (
            <VeiculoCard 
              key={veiculo.id}
              veiculo={veiculo}
              onEdit={() => handleOpenModal(veiculo)}
              onToggleAtivo={() => handleToggleAtivo(veiculo)}
              onDelete={() => handleDelete(veiculo.id)}
            />
          ))}

          {veiculosFiltrados.length === 0 && (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '48px 0'
            }}>
              <Car style={{ margin: '0 auto 16px', color: 'rgba(255, 255, 255, 0.4)' }} size={48} />
              <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '18px', margin: 0 }}>Nenhum veículo encontrado</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Cadastro/Edição */}
      {showModal && (
        <Modal title={editingVeiculo ? 'Editar Veículo' : 'Novo Veículo'} onClose={() => setShowModal(false)}>
          <FormVeiculo
            formData={formData}
            formErrors={formErrors}
            onChange={setFormData}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </Modal>
      )}

      {/* Footer */}
      <footer style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '14px',
        background: 'rgba(0, 0, 0, 0.6)'
      }}>
        AutoCheck – v1.0 – João Vítor Barchfeld – 2025
      </footer>
    </div>
  );
};

const Modal = ({ title, children, onClose }: any) => {
  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'rgba(0, 0, 0, 0.7)'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'rgba(0, 0, 0, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.35)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(0, 0, 0, 0.95)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              color: 'rgba(255, 255, 255, 0.6)',
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: '24px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

const FormVeiculo = ({ formData, formErrors, onChange, onSubmit, loading }: any) => {
  const handleChange = (field: string, value: any) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Nome */}
      <div>
        <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
          Nome *
        </label>
        <input
          type="text"
          value={formData.nome}
          onChange={(e) => handleChange('nome', e.target.value)}
          placeholder="Ex: Onix LTZ"
          style={{
            width: '100%',
            height: '44px',
            padding: '0 16px',
            color: '#ffffff',
            background: 'rgba(0, 0, 0, 0.48)',
            border: `1px solid ${formErrors.nome ? '#FF3B30' : 'rgba(255, 255, 255, 0.12)'}`,
            borderRadius: '12px',
            outline: 'none',
            fontSize: '14px'
          }}
        />
        {formErrors.nome && <p style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '4px' }}>{formErrors.nome}</p>}
      </div>

      {/* Placa */}
      <div>
        <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
          Placa *
        </label>
        <input
          type="text"
          value={formData.placa}
          onChange={(e) => handleChange('placa', e.target.value.toUpperCase())}
          placeholder="ABC1D23"
          maxLength={8}
          style={{
            width: '100%',
            height: '44px',
            padding: '0 16px',
            color: '#ffffff',
            background: 'rgba(0, 0, 0, 0.48)',
            border: `1px solid ${formErrors.placa ? '#FF3B30' : 'rgba(255, 255, 255, 0.12)'}`,
            borderRadius: '12px',
            outline: 'none',
            fontSize: '14px'
          }}
        />
        {formErrors.placa && <p style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '4px' }}>{formErrors.placa}</p>}
      </div>

      {/* Cor */}
      <div>
        <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
          Cor *
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="color"
            value={formData.cor_hex}
            onChange={(e) => handleChange('cor_hex', e.target.value)}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              cursor: 'pointer',
              background: 'rgba(0, 0, 0, 0.48)',
              border: '1px solid rgba(255, 255, 255, 0.12)'
            }}
          />
          <input
            type="text"
            value={formData.cor_hex}
            onChange={(e) => handleChange('cor_hex', e.target.value)}
            placeholder="#4A90E2"
            maxLength={7}
            style={{
              flex: 1,
              height: '44px',
              padding: '0 16px',
              color: '#ffffff',
              background: 'rgba(0, 0, 0, 0.48)',
              border: `1px solid ${formErrors.cor_hex ? '#FF3B30' : 'rgba(255, 255, 255, 0.12)'}`,
              borderRadius: '12px',
              outline: 'none',
              fontSize: '14px'
            }}
          />
          <div 
            style={{ 
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              border: `2px solid ${formData.cor_hex}`
            }}
          >
            <Car size={24} color="#ffffff" />
          </div>
        </div>
        {formErrors.cor_hex && <p style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '4px' }}>{formErrors.cor_hex}</p>}
      </div>

      {/* Tipo e Combustível */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
            Tipo
          </label>
          <select
            value={formData.tipo}
            onChange={(e) => handleChange('tipo', e.target.value)}
            style={{
              width: '100%',
              height: '44px',
              padding: '0 16px',
              color: '#ffffff',
              background: 'rgba(0, 0, 0, 0.48)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              outline: 'none',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <option value="leve">Leve</option>
            <option value="medio">Médio</option>
            <option value="pesado">Pesado</option>
            <option value="moto">Motocicleta</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
            Combustível
          </label>
          <select
            value={formData.combustivel}
            onChange={(e) => handleChange('combustivel', e.target.value)}
            style={{
              width: '100%',
              height: '44px',
              padding: '0 16px',
              color: '#ffffff',
              background: 'rgba(0, 0, 0, 0.48)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              outline: 'none',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <option value="gasolina">Gasolina</option>
            <option value="etanol">Etanol</option>
            <option value="diesel">Diesel</option>
            <option value="flex">Flex</option>
            <option value="eletrico">Elétrico</option>
            <option value="hibrido">Híbrido</option>
          </select>
        </div>
      </div>

      {/* Ano e Odômetro */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
            Ano
          </label>
          <input
            type="number"
            value={formData.ano_modelo}
            onChange={(e) => handleChange('ano_modelo', e.target.value)}
            placeholder="2024"
            min="1950"
            style={{
              width: '100%',
              height: '44px',
              padding: '0 16px',
              color: '#ffffff',
              background: 'rgba(0, 0, 0, 0.48)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              outline: 'none',
              fontSize: '14px'
            }}
          />
          {formErrors.ano_modelo && <p style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '4px' }}>{formErrors.ano_modelo}</p>}
        </div>

        <div>
          <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
            Odômetro (km)
          </label>
          <input
            type="number"
            value={formData.odometro}
            onChange={(e) => handleChange('odometro', e.target.value)}
            placeholder="0"
            min="0"
            style={{
              width: '100%',
              height: '44px',
              padding: '0 16px',
              color: '#ffffff',
              background: 'rgba(0, 0, 0, 0.48)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              outline: 'none',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      {/* Botões */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={formData.ativo}
            onChange={(e) => handleChange('ativo', e.target.checked)}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
          <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>Veículo ativo</span>
        </label>

        <button
          onClick={onSubmit}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 24px',
            borderRadius: '8px',
            background: loading ? 'rgba(74, 144, 226, 0.5)' : 'rgba(74, 144, 226, 0.9)',
            color: '#ffffff',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => !loading && (e.currentTarget.style.background = 'rgba(74, 144, 226, 1)')}
          onMouseLeave={(e) => !loading && (e.currentTarget.style.background = 'rgba(74, 144, 226, 0.9)')}
        >
          <Save size={16} />
          <span>{loading ? 'Salvando...' : 'Salvar'}</span>
        </button>
      </div>
    </div>
  );
};

const VeiculoCard = ({ veiculo, onEdit, onToggleAtivo, onDelete }: any) => {
  return (
    <div style={{
      position: 'relative',
      padding: '16px',
      background: 'rgba(0, 0, 0, 0.48)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      transition: 'transform 0.2s'
    }}>
      {/* Header com Preview e Status */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ 
          flexShrink: 0,
          width: '64px',
          height: '64px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.6)',
          border: `3px solid ${veiculo.cor_hex}`
        }}>
          <Car size={28} color="#ffffff" strokeWidth={2} />
        </div>

        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '500',
          background: veiculo.ativo ? 'rgba(52, 199, 89, 0.2)' : 'rgba(255, 59, 48, 0.2)',
          color: veiculo.ativo ? '#34C759' : '#FF3B30'
        }}>
          {veiculo.ativo ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      {/* Nome e Placa */}
      <div style={{ marginBottom: '12px' }}>
        <h3 style={{ 
          color: '#ffffff',
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '4px',
          margin: 0,
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        }}>
          {veiculo.nome}
        </h3>
        <p style={{ 
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: '500',
          opacity: 0.85,
          margin: '4px 0 0 0'
        }}>
          {veiculo.placa}
        </p>
      </div>

      {/* Informações principais */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
          <span style={{ color: '#ffffff', opacity: 0.7 }}>Tipo:</span>
          <span style={{ color: '#ffffff', fontWeight: '500', textTransform: 'capitalize' }}>{veiculo.tipo}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
          <span style={{ color: '#ffffff', opacity: 0.7 }}>Combustível:</span>
          <span style={{ color: '#ffffff', fontWeight: '500', textTransform: 'capitalize' }}>{veiculo.combustivel}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
          <span style={{ color: '#ffffff', opacity: 0.7 }}>Ano:</span>
          <span style={{ color: '#ffffff', fontWeight: '500' }}>{veiculo.ano_modelo || '-'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
          <span style={{ color: '#ffffff', opacity: 0.7 }}>Odômetro:</span>
          <span style={{ color: '#ffffff', fontWeight: '500' }}>{veiculo.odometro.toLocaleString('pt-BR')} km</span>
        </div>
      </div>

      {/* Ações */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        paddingTop: '12px', 
        borderTop: '1px solid rgba(255, 255, 255, 0.1)' 
      }}>
        <button
          onClick={onEdit}
          style={{ 
            flex: 1,
            padding: '8px',
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            fontSize: '12px',
            fontWeight: '500',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          title="Editar"
        >
          <Edit size={16} color="#ffffff" />
          <span style={{ color: '#ffffff' }}>Editar</span>
        </button>
        <button
          onClick={onToggleAtivo}
          style={{ 
            padding: '8px',
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          title={veiculo.ativo ? 'Inativar' : 'Ativar'}
        >
          {veiculo.ativo ? <PowerOff size={18} color="#ffffff" /> : <Power size={18} color="#ffffff" />}
        </button>
        <button
          onClick={onDelete}
          style={{ 
            padding: '8px',
            background: 'rgba(255, 59, 48, 0.15)',
            color: '#ff6b6b',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 59, 48, 0.25)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 59, 48, 0.15)'}
          title="Excluir"
        >
          <Trash2 size={18} color="#ff6b6b" />
        </button>
      </div>
    </div>
  );
};

export default VeiculosPage;