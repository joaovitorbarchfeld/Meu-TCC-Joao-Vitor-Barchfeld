import { db } from '@/config/db';

export class RelatoriosService {
  async getKPIs(filters: { start: string; end: string; vehicle_id?: string; user_id?: string }) {
    const startDate = new Date(filters.start);
    const endDate = new Date(filters.end);

    let query = db
      .selectFrom('reservas')
      .where('canceled_at', 'is', null)
      .where('start_at', '>=', startDate)
      .where('start_at', '<=', endDate);

    if (filters.vehicle_id) {
      query = query.where('veiculo_id', '=', filters.vehicle_id);
    }

    if (filters.user_id) {
      query = query.where('user_id', '=', filters.user_id);
    }

    const reservas = await query.execute();

    // Cálculos
    const totalReservas = reservas.length;
    let tempoUsoH = 0;

    reservas.forEach(r => {
      const diff = new Date(r.end_at).getTime() - new Date(r.start_at).getTime();
      tempoUsoH += diff / (1000 * 60 * 60);
    });

    // Estimativas
    const distanciaKmEst = tempoUsoH * 40; // ~40km/h média
    const consumoEst = distanciaKmEst * 0.1; // ~10L/100km

    return {
      reservas: totalReservas,
      tempo_uso_h: tempoUsoH,
      distancia_km_est: distanciaKmEst,
      consumo_est: consumoEst
    };
  }

  async getSeries(filters: { start: string; end: string; vehicle_id?: string; user_id?: string }) {
    const startDate = new Date(filters.start);
    const endDate = new Date(filters.end);

    // Gerar array de datas
    const dates: string[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Mock de dados (em produção, viria da telemetria)
    const series = dates.map(date => ({
      date,
      utilizacao_h: Math.random() * 8,
      reservas: Math.floor(Math.random() * 5),
      aceleracoes_bruscas: Math.floor(Math.random() * 10),
      frenagens_bruscas: Math.floor(Math.random() * 8)
    }));

    return series;
  }

  async getVeiculos(filters: { start: string; end: string; page?: number; size?: number }) {
    // Mock de dados por veículo
    const veiculos = await db
      .selectFrom('veiculos')
      .select(['id', 'nome', 'placa'])
      .where('ativo', '=', true)
      .execute();

    const relatorio = veiculos.map(v => ({
      veiculo_id: v.id,
      veiculo_nome: v.nome,
      veiculo_placa: v.placa,
      reservas: Math.floor(Math.random() * 20),
      tempo_uso_h: Math.random() * 50,
      distancia_est_km: Math.random() * 500,
      consumo_est: (Math.random() * 50).toFixed(1) + 'L',
      eventos_conducao: Math.floor(Math.random() * 30)
    }));

    return relatorio;
  }
}