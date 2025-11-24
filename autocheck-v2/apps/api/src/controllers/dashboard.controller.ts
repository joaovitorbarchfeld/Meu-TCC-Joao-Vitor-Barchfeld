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
        let usuario_nome: string | undefined = undefined;

        if (!veiculo.ativo) {
          status = 'inativo';
        } else {
          const reservaAtiva = await db
            .selectFrom('reservas')
            .innerJoin('usuarios', 'reservas.usuario_id', 'usuarios.id')
            .select(['reservas.id', 'usuarios.nome as usuario_nome'])
            .where('reservas.veiculo_id', '=', veiculo.id)
            .where('reservas.start_at', '<=', new Date())
            .where('reservas.end_at', '>', new Date())
            .executeTakeFirst();

          if (reservaAtiva) {
            status = 'em_uso';
            usuario_nome = reservaAtiva.usuario_nome;
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

        return { ...veiculo, status, usuario_nome };
      })
    );

    res.json(veiculosComStatus);
  }
}

export const dashboardController = new DashboardController();
