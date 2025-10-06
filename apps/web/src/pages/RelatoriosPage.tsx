// apps/web/src/pages/RelatoriosPage.tsx

import { useState, useEffect } from 'react';
import { ChevronLeft, BarChart3, Download, Calendar, TrendingUp, Clock, Route, Fuel, Activity } from 'lucide-react';
import { api } from '../services/api';

interface KPIs {
  reservas: number;
  tempo_uso_h: number;
  distancia_km_est: number;
  consumo_est: number;
}

interface SerieData {
  date: string;
  utilizacao_h: number;
  reservas: number;
  aceleracoes_bruscas: number;
  frenagens_bruscas: number;
}

interface VeiculoRelatorio {
  veiculo_id: string;
  veiculo_nome: string;
  veiculo_placa: string;
  reservas: number;
  tempo_uso_h: number;
  distancia_est_km: number;
  consumo_est: string;
  eventos_conducao: number;
}

interface Veiculo {
  id: string;
  nome: string;
  placa: string;
}

interface Usuario {
  id: string;
  nome: string;
}

const RelatoriosPage = () => {
  const [kpis, setKpis] = useState<KPIs>({ reservas: 0, tempo_uso_h: 0, distancia_km_est: 0, consumo_est: 0 });
  const [series, setSeries] = useState<SerieData[]>([]);
  const [veiculosRelatorio, setVeiculosRelatorio] = useState<VeiculoRelatorio[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtros
  const [periodoRapido, setPeriodoRapido] = useState('30d');
  const [veiculoId, setVeiculoId] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (veiculos.length > 0) {
      loadRelatorios();
    }
  }, [periodoRapido, veiculoId, usuarioId, startDate, endDate]);

  const loadInitialData = async () => {
    try {
      const [veiculosRes, usuariosRes] = await Promise.all([
        api.get('/veiculos'),
        api.get('/usuarios')
      ]);
      setVeiculos(veiculosRes.data);
      setUsuarios(usuariosRes.data);
    } catch (err: any) {
      console.error('Erro ao carregar dados iniciais:', err);
      setError('Erro ao carregar dados');
    }
  };

  const loadRelatorios = async () => {
    setLoading(true);
    try {
      const params = getDateParams();

      const [kpisRes, seriesRes, veiculosRes] = await Promise.all([
        api.get('/relatorios/kpis', { params }),
        api.get('/relatorios/series', { params }),
        api.get('/relatorios/veiculos', { params })
      ]);

      setKpis(kpisRes.data);
      setSeries(seriesRes.data);
      setVeiculosRelatorio(veiculosRes.data);
    } catch (err: any) {
      console.error('Erro ao carregar relatórios:', err);
      setError('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const getDateParams = () => {
    const params: any = {};
    
    if (veiculoId) params.vehicle_id = veiculoId;
    if (usuarioId) params.user_id = usuarioId;

    if (periodoRapido === 'custom') {
      if (startDate) params.start = new Date(startDate).toISOString();
      if (endDate) params.end = new Date(endDate).toISOString();
    } else {
      const end = new Date();
      const start = new Date();

      switch (periodoRapido) {
        case 'hoje':
          start.setHours(0, 0, 0, 0);
          break;
        case '7d':
          start.setDate(start.getDate() - 7);
          break;
        case '30d':
          start.setDate(start.getDate() - 30);
          break;
        case 'mes':
          start.setDate(1);
          start.setHours(0, 0, 0, 0);
          break;
        case 'mes_passado':
          start.setMonth(start.getMonth() - 1);
          start.setDate(1);
          start.setHours(0, 0, 0, 0);
          end.setDate(0);
          end.setHours(23, 59, 59, 999);
          break;
      }

      params.start = start.toISOString();
      params.end = end.toISOString();
    }

    return params;
  };

  const handleExportCSV = async () => {
    try {
      const params = getDateParams();
      const response = await api.get('/relatorios/export.csv', { 
        params,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      setError('Erro ao exportar CSV');
    }
  };

  const getMaxValue = (data: SerieData[], key: keyof SerieData) => {
    return Math.max(...data.map(d => Number(d[key])), 0);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #071327 0%, #2C0F4D 100%)', color: '#ffffff', paddingBottom: '80px' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: rgba(255, 255, 255, 0.5) !important; }
        select option { background: #1a1a2e !important; color: #ffffff !important; }
        input, select { color: #ffffff !important; }
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
          <BarChart3 size={24} color="#ffffff" />
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff' }}>Relatórios e Análises</h1>
        </div>
        <button
          onClick={handleExportCSV}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
        >
          <Download size={16} />
          Exportar CSV
        </button>
      </header>

      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Filtros */}
        <div style={{ padding: '20px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', marginBottom: '24px' }}>
          <h3 style={{ color: '#ffffff', fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} />
            Filtros
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {/* Período */}
            <div>
              <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', marginBottom: '6px' }}>Período</label>
              <select
                value={periodoRapido}
                onChange={(e) => setPeriodoRapido(e.target.value)}
                style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '14px' }}
              >
                <option value="hoje">Hoje</option>
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="mes">Este mês</option>
                <option value="mes_passado">Mês passado</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>

            {/* Datas customizadas */}
            {periodoRapido === 'custom' && (
              <>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', marginBottom: '6px' }}>Data Início</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', marginBottom: '6px' }}>Data Fim</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '14px' }}
                  />
                </div>
              </>
            )}

            {/* Veículo */}
            <div>
              <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', marginBottom: '6px' }}>Veículo</label>
              <select
                value={veiculoId}
                onChange={(e) => setVeiculoId(e.target.value)}
                style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '14px' }}
              >
                <option value="">Todos os veículos</option>
                {veiculos.map(v => (
                  <option key={v.id} value={v.id}>{v.nome} - {v.placa}</option>
                ))}
              </select>
            </div>

            {/* Usuário */}
            <div>
              <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', marginBottom: '6px' }}>Condutor</label>
              <select
                value={usuarioId}
                onChange={(e) => setUsuarioId(e.target.value)}
                style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '6px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#ffffff', fontSize: '14px' }}
              >
                <option value="">Todos os condutores</option>
                {usuarios.map(u => (
                  <option key={u.id} value={u.id}>{u.nome}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#ffffff' }}>Carregando relatórios...</div>
        ) : (
          <>
            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {/* Reservas */}
              <div style={{ padding: '20px', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <Calendar size={24} color="#a78bfa" />
                  <TrendingUp size={18} color="#a78bfa" />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffffff', marginBottom: '4px' }}>{kpis.reservas}</div>
                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>Reservas</div>
              </div>

              {/* Tempo de Uso */}
              <div style={{ padding: '20px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <Clock size={24} color="#60a5fa" />
                  <TrendingUp size={18} color="#60a5fa" />
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffffff', marginBottom: '4px' }}>{kpis.tempo_uso_h.toFixed(1)}h</div>
                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>Tempo de Uso</div>
              </div>

              {/* Distância Estimada */}
              <div style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <Route size={24} color="#34d399" />
                  <div style={{ padding: '4px 8px', background: 'rgba(251, 191, 36, 0.2)', borderRadius: '4px', fontSize: '10px', fontWeight: '600', color: '#fbbf24' }}>
                    ESTIMATIVA
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffffff', marginBottom: '4px' }}>{kpis.distancia_km_est.toFixed(0)}km</div>
                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>Distância Estimada</div>
              </div>

              {/* Consumo Estimado */}
              <div style={{ padding: '20px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <Fuel size={24} color="#fbbf24" />
                  <div style={{ padding: '4px 8px', background: 'rgba(251, 191, 36, 0.2)', borderRadius: '4px', fontSize: '10px', fontWeight: '600', color: '#fbbf24' }}>
                    ESTIMATIVA
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffffff', marginBottom: '4px' }}>{kpis.consumo_est.toFixed(1)}L</div>
                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>Consumo Estimado</div>
              </div>
            </div>

            {/* Gráficos */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              {/* Gráfico de Utilização */}
              <div style={{ padding: '20px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px' }}>
                <h3 style={{ color: '#ffffff', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                  Utilização Diária (horas)
                </h3>
                <div style={{ height: '200px', position: 'relative' }}>
                  {series.length > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '100%', gap: '4px' }}>
                      {series.map((item, idx) => {
                        const maxVal = getMaxValue(series, 'utilizacao_h');
                        const height = maxVal > 0 ? (item.utilizacao_h / maxVal) * 100 : 0;
                        return (
                          <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.6)' }}>{item.utilizacao_h.toFixed(1)}h</div>
                            <div
                              style={{
                                width: '100%',
                                height: `${height}%`,
                                background: 'linear-gradient(180deg, #8b5cf6 0%, #6366f1 100%)',
                                borderRadius: '4px 4px 0 0',
                                minHeight: item.utilizacao_h > 0 ? '4px' : '0'
                              }}
                            />
                            <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)' }}>
                              {new Date(item.date).getDate()}/{new Date(item.date).getMonth() + 1}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255, 255, 255, 0.5)' }}>
                      Sem dados para o período
                    </div>
                  )}
                </div>
              </div>

              {/* Gráfico de Condução */}
              <div style={{ padding: '20px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px' }}>
                <h3 style={{ color: '#ffffff', fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={18} />
                  Eventos de Condução
                </h3>
                <div style={{ height: '200px', position: 'relative' }}>
                  {series.length > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '100%', gap: '2px' }}>
                      {series.map((item, idx) => {
                        const maxAcel = getMaxValue(series, 'aceleracoes_bruscas');
                        const maxFren = getMaxValue(series, 'frenagens_bruscas');
                        const maxVal = Math.max(maxAcel, maxFren);
                        const heightAcel = maxVal > 0 ? (item.aceleracoes_bruscas / maxVal) * 100 : 0;
                        const heightFren = maxVal > 0 ? (item.frenagens_bruscas / maxVal) * 100 : 0;
                        
                        return (
                          <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <div style={{ display: 'flex', gap: '2px', height: '100%', alignItems: 'flex-end' }}>
                              <div
                                title={`${item.aceleracoes_bruscas} acelerações`}
                                style={{
                                  width: '50%',
                                  height: `${heightAcel}%`,
                                  background: '#ef4444',
                                  borderRadius: '2px 2px 0 0',
                                  minHeight: item.aceleracoes_bruscas > 0 ? '4px' : '0'
                                }}
                              />
                              <div
                                title={`${item.frenagens_bruscas} frenagens`}
                                style={{
                                  width: '50%',
                                  height: `${heightFren}%`,
                                  background: '#f59e0b',
                                  borderRadius: '2px 2px 0 0',
                                  minHeight: item.frenagens_bruscas > 0 ? '4px' : '0'
                                }}
                              />
                            </div>
                            <div style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.5)' }}>
                              {new Date(item.date).getDate()}/{new Date(item.date).getMonth() + 1}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255, 255, 255, 0.5)' }}>
                      Sem dados para o período
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '2px' }} />
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Acelerações</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '2px' }} />
                    <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Frenagens</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabela por Veículo */}
            <div style={{ padding: '20px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px' }}>
              <h3 style={{ color: '#ffffff', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                Detalhamento por Veículo
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <th style={{ padding: '12px', textAlign: 'left', color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', fontWeight: '600' }}>Veículo</th>
                      <th style={{ padding: '12px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', fontWeight: '600' }}>Reservas</th>
                      <th style={{ padding: '12px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', fontWeight: '600' }}>Tempo (h)</th>
                      <th style={{ padding: '12px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', fontWeight: '600' }}>Distância (km)</th>
                      <th style={{ padding: '12px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', fontWeight: '600' }}>Consumo</th>
                      <th style={{ padding: '12px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', fontWeight: '600' }}>Eventos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {veiculosRelatorio.length > 0 ? (
                      veiculosRelatorio.map((veiculo, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <td style={{ padding: '12px', color: '#ffffff', fontSize: '14px' }}>
                            <div style={{ fontWeight: '500' }}>{veiculo.veiculo_nome}</div>
                            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>{veiculo.veiculo_placa}</div>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', color: '#ffffff', fontSize: '14px' }}>{veiculo.reservas}</td>
                          <td style={{ padding: '12px', textAlign: 'center', color: '#ffffff', fontSize: '14px' }}>{veiculo.tempo_uso_h.toFixed(1)}</td>
                          <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px' }}>
                            <span style={{ color: '#ffffff' }}>{veiculo.distancia_est_km.toFixed(0)}</span>
                            <span style={{ color: 'rgba(251, 191, 36, 0.7)', fontSize: '10px', marginLeft: '4px' }}>EST</span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px' }}>
                            <span style={{ color: '#ffffff' }}>{veiculo.consumo_est}</span>
                            <span style={{ color: 'rgba(251, 191, 36, 0.7)', fontSize: '10px', marginLeft: '4px' }}>EST</span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center', color: '#ffffff', fontSize: '14px' }}>{veiculo.eventos_conducao}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)' }}>
                          Nenhum dado encontrado para o período selecionado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px', background: 'rgba(0, 0, 0, 0.6)', textAlign: 'center' }}>
       <p style={{ color: '#ffffff', fontSize: '14px', margin: 0 }}>AutoCheck – v1.0 – João Vítor Barchfeld – 2025</p>
      </footer>
    </div>
  );
};

export default RelatoriosPage;