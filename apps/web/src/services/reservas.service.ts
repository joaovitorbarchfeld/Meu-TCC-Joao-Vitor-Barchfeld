import { randomUUID } from 'crypto';
import { db } from '@/config/db';
import { AppError } from '@/middlewares/errorHandler';

export class ReservasService {
  async list(filters: { start: string; end: string; veiculo_id?: string; user_id?: string }) {
    let query = db
      .selectFrom('reservas')
      .selectAll()
      .where('start_at', '<', new Date(filters.end))
      .where('end_at', '>', new Date(filters.start))
      .where('canceled_at', 'is', null);

    if (filters.veiculo_id) {
      query = query.where('veiculo_id', '=', filters.veiculo_id);
    }

    if (filters.user_id) {
      query = query.where('user_id', '=', filters.user_id);
    }

    return await query.orderBy('start_at').execute();
  }

  async findById(id: string) {
    const reserva = await db
      .selectFrom('reservas')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!reserva) {
      throw new AppError(404, 'NOT_FOUND', 'Reserva não encontrada');
    }

    return reserva;
  }

  async create(data: any) {
    // Verificar overlap
    const hasOverlap = await this.checkOverlap(
      data.veiculo_id,
      new Date(data.start_at),
      new Date(data.end_at)
    );

    if (hasOverlap) {
      throw new AppError(409, 'OVERLAP', 'Intervalo conflita com outra reserva para este veículo.');
    }

    const reserva = await db
      .insertInto('reservas')
      .values({
        id: randomUUID(),
        created_at: new Date(),
        updated_at: new Date(),
        ...data,
        start_at: new Date(data.start_at),
        end_at: new Date(data.end_at),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return reserva;
  }

  async update(id: string, data: any) {
    if (data.veiculo_id || data.start_at || data.end_at) {
      const current = await this.findById(id);
      const veiculoId = data.veiculo_id || current.veiculo_id;
      const startAt = data.start_at ? new Date(data.start_at) : current.start_at;
      const endAt = data.end_at ? new Date(data.end_at) : current.end_at;

      const hasOverlap = await this.checkOverlap(veiculoId, startAt, endAt, id);

      if (hasOverlap) {
        throw new AppError(409, 'OVERLAP', 'Intervalo conflita com outra reserva para este veículo.');
      }
    }

    const reserva = await db
      .updateTable('reservas')
      .set({
        ...data,
        updated_at: new Date(),
        ...(data.start_at && { start_at: new Date(data.start_at) }),
        ...(data.end_at && { end_at: new Date(data.end_at) }),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    if (!reserva) {
      throw new AppError(404, 'NOT_FOUND', 'Reserva não encontrada');
    }

    return reserva;
  }

  async delete(id: string) {
    const result = await db
      .deleteFrom('reservas')
      .where('id', '=', id)
      .execute();

    if (result.length === 0) {
      throw new AppError(404, 'NOT_FOUND', 'Reserva não encontrada');
    }

    return true;
  }

  private async checkOverlap(
    veiculoId: string,
    startAt: Date,
    endAt: Date,
    excludeId?: string
  ): Promise<boolean> {
    let query = db
      .selectFrom('reservas')
      .select('id')
      .where('veiculo_id', '=', veiculoId)
      .where('canceled_at', 'is', null)
      .where((eb) =>
        eb.and([
          eb('start_at', '<', endAt),
          eb('end_at', '>', startAt),
        ])
      );

    if (excludeId) {
      query = query.where('id', '!=', excludeId);
    }

    const conflict = await query.executeTakeFirst();
    return !!conflict;
  }
}