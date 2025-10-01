import { randomUUID } from 'crypto';
import { db } from '@/config/db';
import { AppError } from '@/middlewares/errorHandler';

export class VeiculosService {
  async list(filters: { q?: string; tipo?: string; ativo?: boolean; page?: number; size?: number }) {
    const page = filters.page || 1;
    const size = filters.size || 25;
    
    let query = db.selectFrom('veiculos').selectAll();

    if (filters.q) {
      query = query.where((eb) =>
        eb.or([
          eb('nome', 'ilike', `%${filters.q}%`),
          eb('placa', 'ilike', `%${filters.q}%`),
        ])
      );
    }

    if (filters.tipo) {
      query = query.where('tipo', '=', filters.tipo as any);
    }

    if (filters.ativo !== undefined) {
      query = query.where('ativo', '=', filters.ativo);
    }

    const data = await query
      .orderBy('nome')
      .limit(size)
      .offset((page - 1) * size)
      .execute();

    return data;
  }

  async findById(id: string) {
    const veiculo = await db
      .selectFrom('veiculos')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!veiculo) {
      throw new AppError(404, 'NOT_FOUND', 'Veículo não encontrado');
    }

    return veiculo;
  }

  async create(data: any) {
    const veiculo = await db
      .insertInto('veiculos')
      .values({
        id: randomUUID(),
        created_at: new Date(),
        updated_at: new Date(),
        ...data,
        placa: data.placa?.toUpperCase(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return veiculo;
  }

  async update(id: string, data: any) {
    const veiculo = await db
      .updateTable('veiculos')
      .set({
        ...data,
        updated_at: new Date(),
        ...(data.placa && { placa: data.placa.toUpperCase() }),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    if (!veiculo) {
      throw new AppError(404, 'NOT_FOUND', 'Veículo não encontrado');
    }

    return veiculo;
  }

  async delete(id: string) {
    const result = await db
      .deleteFrom('veiculos')
      .where('id', '=', id)
      .execute();

    if (result.length === 0) {
      throw new AppError(404, 'NOT_FOUND', 'Veículo não encontrado');
    }

    return true;
  }
}