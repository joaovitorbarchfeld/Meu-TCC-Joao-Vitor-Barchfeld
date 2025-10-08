import { randomUUID } from 'crypto';
import { db } from '@/config/db';
import { AppError } from '@/middlewares/errorHandler';

export class DispositivosService {
  async list(filters: { q?: string; status?: string; vinculo?: string; page?: number; size?: number }) {
    const page = filters.page || 1;
    const size = filters.size || 25;
    
    let query = db.selectFrom('dispositivos').selectAll();

    if (filters.q) {
      query = query.where((eb) =>
        eb.or([
          eb('serial', 'ilike', `%${filters.q}%`),
          eb('modelo', 'ilike', `%${filters.q}%`),
        ])
      );
    }

    if (filters.status) {
      query = query.where('status', '=', filters.status as any);
    }

    if (filters.vinculo === 'vinculados') {
      query = query.where('veiculo_id', 'is not', null);
    } else if (filters.vinculo === 'livres') {
      query = query.where('veiculo_id', 'is', null);
    }

    const data = await query
      .orderBy('serial')
      .limit(size)
      .offset((page - 1) * size)
      .execute();

    return data;
  }

  async findById(id: string) {
    const dispositivo = await db
      .selectFrom('dispositivos')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!dispositivo) {
      throw new AppError(404, 'NOT_FOUND', 'Dispositivo não encontrado');
    }

    return dispositivo;
  }

  async create(data: any) {
    const dispositivo = await db
      .insertInto('dispositivos')
      .values({
        id: randomUUID(),
        created_at: new Date(),
        updated_at: new Date(),
        ...data,
        status: 'nunca_pareado',
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return dispositivo;
  }

  async update(id: string, data: any) {
    const dispositivo = await db
      .updateTable('dispositivos')
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    if (!dispositivo) {
      throw new AppError(404, 'NOT_FOUND', 'Dispositivo não encontrado');
    }

    return dispositivo;
  }

  async updateSensores(id: string, sensores: any) {
    const dispositivo = await db
      .updateTable('dispositivos')
      .set({
        ...sensores,
        updated_at: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    if (!dispositivo) {
      throw new AppError(404, 'NOT_FOUND', 'Dispositivo não encontrado');
    }

    return dispositivo;
  }

  async updateVinculo(id: string, veiculo_id: string | null) {
    const dispositivo = await db
      .updateTable('dispositivos')
      .set({
        veiculo_id: veiculo_id,
        updated_at: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    if (!dispositivo) {
      throw new AppError(404, 'NOT_FOUND', 'Dispositivo não encontrado');
    }

    return dispositivo;
  }

  async testar(id: string) {
    const dispositivo = await this.findById(id);
    
    // Mock de teste de comunicação
    const latency = Math.floor(Math.random() * 40) + 10; // 10-50ms
    
    return {
      ok: true,
      latency_ms: latency
    };
  }
}