import { Request, Response } from 'express';
import { db } from '../config/db';

export class DashboardController {
  async getVeiculos(req: Request, res: Response) {
    const veiculos = await db
      .selectFrom('veiculos')
      .select(['id', 'nome', 'placa', 'cor_hex', 'ativo'])
      .orderBy('nome', 'asc')
      .execute();

    const veiculosComStatus = await Promise.all(
      veiculos.map(async (veiculo) => {
        let status: 'inativo' | 'em_uso' | 'sem_dispositivo' | 'disponivel' = 'disponivel';

        if (!veiculo.ativo) {
          status = 'inativo';
        } else {
          const reservaAtiva = await db
            .selectFrom('reservas')
            .select('id')
            .where('veiculo_id', '=', veiculo.id)
            .where('start_at', '<=', new Date())
            .where('end_at', '>', new Date())
            .executeTakeFirst();

          if (reservaAtiva) {
            status = 'em_uso';
          } else {
            const dispositivo = await db
              .selectFrom('dispositivos')
              .select('id')
              .where('veiculo_id', '=', veiculo.id)
              .where('ativo', '=', true)
              .executeTakeFirst();

            if (!dispositivo) {
              status = 'sem_dispositivo';
            }
          }
        }

        return { ...veiculo, status };
      })
    );

    res.json(veiculosComStatus);
  }
}

export const dashboardController = new DashboardController();
