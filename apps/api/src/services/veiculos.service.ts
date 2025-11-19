import { db } from '../config/db';
import { AppError } from '../middlewares/errorHandler';
import type { VeiculoCreateInput, VeiculoUpdateInput, VeiculoFilter } from '../validators/veiculos.schemas';
import type { VeiculoStatus } from '../types/database';

export class VeiculosService {
  async list(filters: VeiculoFilter) {
    let query = db.selectFrom('veiculos').selectAll();

    // Filtro por busca textual
    if (filters.q) {
      query = query.where((eb) =>
        eb.or([
          eb('nome', 'ilike', `%${filters.q}%`),
          eb('placa', 'ilike', `%${filters.q}%`),
        ])
      );
    }

    // Filtro por tipo
    if (filters.tipo) {
      query = query.where('tipo', '=', filters.tipo);
    }

    // Filtro por combustível
    if (filters.combustivel) {
      query = query.where('combustivel', '=', filters.combustivel);
    }

    // Filtro por ativo
    if (filters.ativo !== undefined) {
      query = query.where('ativo', '=', filters.ativo);
    }

    // Paginação
    const offset = (filters.page - 1) * filters.size;
    query = query.orderBy('nome', 'asc').limit(filters.size).offset(offset);

    const veiculos = await query.execute();

    // Contar total
    let countQuery = db.selectFrom('veiculos').select(db.fn.count('id').as('total'));
    
    if (filters.q) {
      countQuery = countQuery.where((eb) =>
        eb.or([
          eb('nome', 'ilike', `%${filters.q}%`),
          eb('placa', 'ilike', `%${filters.q}%`),
        ])
      );
    }
    if (filters.tipo) countQuery = countQuery.where('tipo', '=', filters.tipo);
    if (filters.combustivel) countQuery = countQuery.where('combustivel', '=', filters.combustivel);
    if (filters.ativo !== undefined) countQuery = countQuery.where('ativo', '=', filters.ativo);

    const countResult = await countQuery.executeTakeFirst();
    const total = Number(countResult?.total || 0);

    return {
      data: veiculos,
      meta: {
        page: filters.page,
        size: filters.size,
        total,
        totalPages: Math.ceil(total / filters.size),
      },
    };
  }

  async getById(id: string) {
    const veiculo = await db
      .selectFrom('veiculos')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!veiculo) {
      throw new AppError(404, 'Veículo não encontrado', 'VEICULO_NOT_FOUND');
    }

    // Buscar status
    const status = await this.getVeiculoStatus(id);

    // Buscar dispositivo vinculado
    const dispositivo = await db
      .selectFrom('dispositivos')
      .select(['id', 'identificador', 'descricao'])
      .where('veiculo_id', '=', id)
      .where('ativo', '=', true)
      .executeTakeFirst();

    return {
      ...veiculo,
      status,
      dispositivo: dispositivo || null,
    };
  }

  async create(input: VeiculoCreateInput) {
    // Verificar se placa já existe
    const placaExiste = await db
      .selectFrom('veiculos')
      .select('id')
      .where('placa', '=', input.placa)
      .executeTakeFirst();

    if (placaExiste) {
      throw new AppError(409, 'Placa já cadastrada', 'PLACA_DUPLICADA');
    }

    const veiculo = await db
      .insertInto('veiculos')
      .values({
        nome: input.nome,
        placa: input.placa.toUpperCase(),
        tipo: input.tipo,
        combustivel: input.combustivel,
        cor_hex: input.cor_hex || '#6B7280',
        ano: input.ano || null,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return veiculo;
  }

  async update(id: string, input: VeiculoUpdateInput) {
    // Verificar se existe
    const existe = await db
      .selectFrom('veiculos')
      .select('id')
      .where('id', '=', id)
      .executeTakeFirst();

    if (!existe) {
      throw new AppError(404, 'Veículo não encontrado', 'VEICULO_NOT_FOUND');
    }

    // Se alterou placa, verificar duplicidade
    if (input.placa) {
      const placaExiste = await db
        .selectFrom('veiculos')
        .select('id')
        .where('placa', '=', input.placa)
        .where('id', '!=', id)
        .executeTakeFirst();

      if (placaExiste) {
        throw new AppError(409, 'Placa já cadastrada em outro veículo', 'PLACA_DUPLICADA');
      }
    }

    const veiculo = await db
      .updateTable('veiculos')
      .set({
        ...input,
        placa: input.placa ? input.placa.toUpperCase() : undefined,
        updated_at: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return veiculo;
  }

  async delete(id: string) {
    // Verificar se tem reservas futuras
    const reservasFuturas = await db
      .selectFrom('reservas')
      .select('id')
      .where('veiculo_id', '=', id)
      .where('end_at', '>', new Date())
      .executeTakeFirst();

    if (reservasFuturas) {
      throw new AppError(
        409,
        'Não é possível excluir: veículo possui reservas futuras',
        'VEICULO_COM_RESERVAS'
      );
    }

    await db.deleteFrom('veiculos').where('id', '=', id).execute();

    return { message: 'Veículo excluído com sucesso' };
  }

  async toggleAtivo(id: string) {
    const veiculo = await db
      .selectFrom('veiculos')
      .select(['id', 'ativo'])
      .where('id', '=', id)
      .executeTakeFirst();

    if (!veiculo) {
      throw new AppError(404, 'Veículo não encontrado', 'VEICULO_NOT_FOUND');
    }

    const atualizado = await db
      .updateTable('veiculos')
      .set({ ativo: !veiculo.ativo, updated_at: new Date() })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return atualizado;
  }

  // Método auxiliar para calcular status
  private async getVeiculoStatus(veiculoId: string): Promise<VeiculoStatus> {
    const veiculo = await db
      .selectFrom('veiculos')
      .select('ativo')
      .where('id', '=', veiculoId)
      .executeTakeFirst();

    if (!veiculo?.ativo) return 'inativo';

    // Verificar reserva ativa
    const reservaAtiva = await db
      .selectFrom('reservas')
      .select('id')
      .where('veiculo_id', '=', veiculoId)
      .where('start_at', '<=', new Date())
      .where('end_at', '>', new Date())
      .executeTakeFirst();

    if (reservaAtiva) return 'em_uso';

    // Verificar dispositivo
    const dispositivo = await db
      .selectFrom('dispositivos')
      .select('id')
      .where('veiculo_id', '=', veiculoId)
      .where('ativo', '=', true)
      .executeTakeFirst();

    if (!dispositivo) return 'sem_dispositivo';

    return 'disponivel';
  }
}

export const veiculosService = new VeiculosService();