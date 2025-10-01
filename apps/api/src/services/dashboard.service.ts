import { db } from '@/config/db';

type VehicleStatus = 'disponivel' | 'em_uso' | 'offline' | 'sem_dispositivo' | 'inativo';

export class DashboardService {
  async getVehiclesWithStatus() {
    // Buscar todos os veículos
    const veiculos = await db
      .selectFrom('veiculos')
      .selectAll()
      .execute();

    // Para cada veículo, calcular o status
    const vehiclesWithStatus = await Promise.all(
      veiculos.map(async (veiculo) => {
        let status: VehicleStatus = 'disponivel';

        // 1. Inativo
        if (!veiculo.ativo) {
          status = 'inativo';
        } 
        // 2. Verificar se tem reserva ativa agora
        else {
          const now = new Date();
          const hasActiveReservation = await db
            .selectFrom('reservas')
            .select('id')
            .where('veiculo_id', '=', veiculo.id)
            .where('canceled_at', 'is', null)
            .where('start_at', '<=', now)
            .where('end_at', '>', now)
            .executeTakeFirst();

          if (hasActiveReservation) {
            status = 'em_uso';
          } else {
            // 3. Verificar dispositivo
            const dispositivo = await db
              .selectFrom('dispositivos')
              .select(['last_seen'])
              .where('veiculo_id', '=', veiculo.id)
              .executeTakeFirst();

            if (!dispositivo) {
              status = 'sem_dispositivo';
            } else if (dispositivo.last_seen) {
              const offlineThreshold = new Date(Date.now() - 10 * 60 * 1000); // 10 minutos
              if (dispositivo.last_seen < offlineThreshold) {
                status = 'offline';
              }
            }
          }
        }

        return {
          id: veiculo.id,
          nome: veiculo.nome,
          placa: veiculo.placa,
          cor_hex: veiculo.cor_hex,
          status,
        };
      })
    );

    // Ordenar: Disponível → Em uso → Offline → Sem dispositivo → Inativo
    const statusOrder: Record<VehicleStatus, number> = {
      disponivel: 1,
      em_uso: 2,
      offline: 3,
      sem_dispositivo: 4,
      inativo: 5,
    };

    return vehiclesWithStatus.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  }
}