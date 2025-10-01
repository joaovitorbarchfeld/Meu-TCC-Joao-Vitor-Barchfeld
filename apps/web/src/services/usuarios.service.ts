import { randomUUID } from 'crypto';
import { db } from '@/config/db';
import { AppError } from '@/middlewares/errorHandler';

export class UsuariosService {
  async list(filters: { q?: string; perfil?: string; ativo?: boolean; page?: number; size?: number }) {
    const page = filters.page || 1;
    const size = filters.size || 25;
    
    let query = db.selectFrom('usuarios').selectAll();

    if (filters.q) {
      query = query.where((eb) =>
        eb.or([
          eb('nome', 'ilike', `%${filters.q}%`),
          eb('email', 'ilike', `%${filters.q}%`),
          eb('cpf', 'ilike', `%${filters.q}%`),
        ])
      );
    }

    if (filters.perfil) {
      query = query.where('perfil', '=', filters.perfil as any);
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
    const usuario = await db
      .selectFrom('usuarios')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!usuario) {
      throw new AppError(404, 'NOT_FOUND', 'Usuário não encontrado');
    }

    return usuario;
  }

  async create(data: any) {
    const usuario = await db
      .insertInto('usuarios')
      .values({
        id: randomUUID(),
        created_at: new Date(),
        updated_at: new Date(),
        ...data,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return usuario;
  }

  async update(id: string, data: any) {
    const usuario = await db
      .updateTable('usuarios')
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    if (!usuario) {
      throw new AppError(404, 'NOT_FOUND', 'Usuário não encontrado');
    }

    return usuario;
  }

  async toggleActive(id: string) {
    const current = await this.findById(id);
    return await db
      .updateTable('usuarios')
      .set({
        ativo: !current.ativo,
        updated_at: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async delete(id: string) {
    const result = await db
      .deleteFrom('usuarios')
      .where('id', '=', id)
      .execute();

    if (result.length === 0) {
      throw new AppError(404, 'NOT_FOUND', 'Usuário não encontrado');
    }

    return true;
  }
}