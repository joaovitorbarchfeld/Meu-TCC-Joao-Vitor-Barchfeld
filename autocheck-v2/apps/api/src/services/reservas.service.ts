import { db } from '../config/db';
import { AppError } from '../middlewares/errorHandler';
import type {
  ReservaCreateInput,
  ReservaUpdateInput,
  ReservaFilter,
  ReservaCalendarioFilter,
} from '../validators/reservas.schemas';

export class ReservasService {
  async list(filters: ReservaFilter, usuarioLogadoId?: string) {
    let query = db
      .selectFrom('reservas')
      .innerJoin('veiculos', 'reservas.veiculo_id', 'veiculos.id')
      .innerJoin('usuarios', 'reservas.usuario_id', 'usuarios.id')
      .select([
        'reservas.id',
        'reservas.veiculo_id',
        'reservas.usuario_id',
        'reservas.start_at',
        'reservas.end_at',
        'reservas.motivo',
        'reservas.created_at',
        'veiculos.nome as veiculo_nome',
        'veiculos.placa as veiculo_placa',
        'veiculos.cor_hex as veiculo_cor',
        'usuarios.nome as usuario_nome',
        'usuarios.email as usuario_email',
      ]);

    // Filtro por período
    if (filters.start) {
      query = query.where('reservas.end_at', '>=', new Date(filters.start));
    }
    if (filters.end) {
      query = query.where('reservas.start_at', '<=', new Date(filters.end));
    }

    // Filtro por veículo
    if (filters.veiculo_id) {
      query = query.where('reservas.veiculo_id', '=', filters.veiculo_id);
    }

    // Filtro por usuário
    if (filters.usuario_id) {
      query = query.where('reservas.usuario_id', '=', filters.usuario_id);
    }

    // Filtro por status
    const agora = new Date();
    if (filters.status === 'ativa') {
      query = query
        .where('reservas.start_at', '<=', agora)
        .where('reservas.end_at', '>', agora);
    } else if (filters.status === 'futura') {
      query = query.where('reservas.start_at', '>', agora);
    } else if (filters.status === 'passada') {
      query = query.where('reservas.end_at', '<=', agora);
    }

    // Paginação
    const offset = (filters.page - 1) * filters.size;
    query = query.orderBy('reservas.start_at', 'desc').limit(filters.size).offset(offset);

    const reservas = await query.execute();

    // Contar total
    let countQuery = db.selectFrom('reservas').select(db.fn.count('id').as('total'));
    
    if (filters.start) countQuery = countQuery.where('end_at', '>=', new Date(filters.start));
    if (filters.end) countQuery = countQuery.where('start_at', '<=', new Date(filters.end));
    if (filters.veiculo_id) countQuery = countQuery.where('veiculo_id', '=', filters.veiculo_id);
    if (filters.usuario_id) countQuery = countQuery.where('usuario_id', '=', filters.usuario_id);
    
    if (filters.status === 'ativa') {
      countQuery = countQuery.where('start_at', '<=', agora).where('end_at', '>', agora);
    } else if (filters.status === 'futura') {
      countQuery = countQuery.where('start_at', '>', agora);
    } else if (filters.status === 'passada') {
      countQuery = countQuery.where('end_at', '<=', agora);
    }

    const countResult = await countQuery.executeTakeFirst();
    const total = Number(countResult?.total || 0);

    return {
      data: reservas,
      meta: {
        page: filters.page,
        size: filters.size,
        total,
        totalPages: Math.ceil(total / filters.size),
      },
    };
  }

  async getById(id: string) {
    const reserva = await db
      .selectFrom('reservas')
      .innerJoin('veiculos', 'reservas.veiculo_id', 'veiculos.id')
      .innerJoin('usuarios', 'reservas.usuario_id', 'usuarios.id')
      .select([
        'reservas.id',
        'reservas.veiculo_id',
        'reservas.usuario_id',
        'reservas.start_at',
        'reservas.end_at',
        'reservas.motivo',
        'reservas.created_at',
        'reservas.updated_at',
        'veiculos.nome as veiculo_nome',
        'veiculos.placa as veiculo_placa',
        'veiculos.tipo as veiculo_tipo',
        'veiculos.cor_hex as veiculo_cor',
        'usuarios.nome as usuario_nome',
        'usuarios.email as usuario_email',
        'usuarios.perfil as usuario_perfil',
      ])
      .where('reservas.id', '=', id)
      .executeTakeFirst();

    if (!reserva) {
      throw new AppError(404, 'Reserva não encontrada', 'RESERVA_NOT_FOUND');
    }

    return reserva;
  }

  async create(input: ReservaCreateInput, usuarioLogadoId: string) {
    const usuarioId = input.usuario_id || usuarioLogadoId;

    // Verificar se veículo existe e está ativo
    const veiculo = await db
      .selectFrom('veiculos')
      .select(['id', 'ativo', 'nome'])
      .where('id', '=', input.veiculo_id)
      .executeTakeFirst();

    if (!veiculo) {
      throw new AppError(404, 'Veículo não encontrado', 'VEICULO_NOT_FOUND');
    }

    if (!veiculo.ativo) {
      throw new AppError(400, 'Veículo está inativo', 'VEICULO_INATIVO');
    }

    // Verificar overlap
    const hasOverlap = await this.checkOverlap(
      input.veiculo_id,
      new Date(input.start_at),
      new Date(input.end_at)
    );

    if (hasOverlap) {
      throw new AppError(
        409,
        'Já existe uma reserva para este veículo no período solicitado',
        'RESERVA_OVERLAP'
      );
    }

    // Criar reserva
    const reserva = await db
      .insertInto('reservas')
      .values({
        veiculo_id: input.veiculo_id,
        usuario_id: usuarioId,
        start_at: new Date(input.start_at),
        end_at: new Date(input.end_at),
        motivo: input.motivo || null,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    // Registrar auditoria
    await db
      .insertInto('auditoria_logs')
      .values({
        usuario_id: usuarioId,
        veiculo_id: input.veiculo_id,
        acao: 'RESERVA_CRIADA',
        detalhes: {
          reserva_id: reserva.id,
          periodo: `${input.start_at} - ${input.end_at}`,
        },
      })
      .execute();

    return reserva;
  }

  async update(id: string, input: ReservaUpdateInput, usuarioLogadoId: string, perfil: string) {
    // Buscar reserva
    const reservaExistente = await db
      .selectFrom('reservas')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!reservaExistente) {
      throw new AppError(404, 'Reserva não encontrada', 'RESERVA_NOT_FOUND');
    }

    // Verificar permissão (só o dono ou gestor/admin pode editar)
    if (
      reservaExistente.usuario_id !== usuarioLogadoId &&
      perfil !== 'gestor' &&
      perfil !== 'admin'
    ) {
      throw new AppError(403, 'Sem permissão para editar esta reserva', 'SEM_PERMISSAO');
    }

    // Não permitir editar reservas passadas
    if (new Date(reservaExistente.end_at) < new Date()) {
      throw new AppError(400, 'Não é possível editar reservas passadas', 'RESERVA_PASSADA');
    }

    // Se alterou datas, verificar overlap
    if (input.start_at || input.end_at) {
      const novoStart = input.start_at ? new Date(input.start_at) : new Date(reservaExistente.start_at);
      const novoEnd = input.end_at ? new Date(input.end_at) : new Date(reservaExistente.end_at);

      const hasOverlap = await this.checkOverlap(
        reservaExistente.veiculo_id,
        novoStart,
        novoEnd,
        id
      );

      if (hasOverlap) {
        throw new AppError(
          409,
          'Já existe outra reserva para este veículo no novo período',
          'RESERVA_OVERLAP'
        );
      }
    }

    // Atualizar
    const reserva = await db
      .updateTable('reservas')
      .set({
        start_at: input.start_at ? new Date(input.start_at) : undefined,
        end_at: input.end_at ? new Date(input.end_at) : undefined,
        motivo: input.motivo !== undefined ? input.motivo : undefined,
        updated_at: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return reserva;
  }

  async delete(id: string, usuarioLogadoId: string, perfil: string) {
    const reserva = await db
      .selectFrom('reservas')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!reserva) {
      throw new AppError(404, 'Reserva não encontrada', 'RESERVA_NOT_FOUND');
    }

    // Verificar permissão
    if (
      reserva.usuario_id !== usuarioLogadoId &&
      perfil !== 'gestor' &&
      perfil !== 'admin'
    ) {
      throw new AppError(403, 'Sem permissão para cancelar esta reserva', 'SEM_PERMISSAO');
    }

    // Não permitir cancelar reservas em andamento ou passadas
    const agora = new Date();
    if (new Date(reserva.start_at) <= agora) {
      throw new AppError(
        400,
        'Não é possível cancelar reservas em andamento ou passadas',
        'RESERVA_INICIADA'
      );
    }

    await db.deleteFrom('reservas').where('id', '=', id).execute();

    // Registrar auditoria
    await db
      .insertInto('auditoria_logs')
      .values({
        usuario_id: usuarioLogadoId,
        veiculo_id: reserva.veiculo_id,
        acao: 'RESERVA_CANCELADA',
        detalhes: { reserva_id: id },
      })
      .execute();

    return { message: 'Reserva cancelada com sucesso' };
  }

  async getMinhasReservas(usuarioId: string, status: 'todas' | 'ativa' | 'futura' | 'passada' = 'todas') {
    const filters: ReservaFilter = {
      usuario_id: usuarioId,
      status,
      page: 1,
      size: 100,
    };

    return this.list(filters, usuarioId);
  }

  async getCalendario(filters: ReservaCalendarioFilter) {
    let query = db
      .selectFrom('reservas')
      .innerJoin('veiculos', 'reservas.veiculo_id', 'veiculos.id')
      .innerJoin('usuarios', 'reservas.usuario_id', 'usuarios.id')
      .select([
        'reservas.id',
        'reservas.veiculo_id',
        'reservas.usuario_id',
        'reservas.start_at',
        'reservas.end_at',
        'reservas.motivo',
        'veiculos.nome as veiculo_nome',
        'veiculos.placa as veiculo_placa',
        'veiculos.cor_hex as veiculo_cor',
        'usuarios.nome as usuario_nome',
      ])
      .where('reservas.start_at', '<=', new Date(filters.end))
      .where('reservas.end_at', '>=', new Date(filters.start));

    if (filters.veiculo_id) {
      query = query.where('reservas.veiculo_id', '=', filters.veiculo_id);
    }

    const reservas = await query.orderBy('reservas.start_at', 'asc').execute();

    return reservas;
  }

  // Método auxiliar para verificar overlap
  private async checkOverlap(
    veiculoId: string,
    start: Date,
    end: Date,
    excludeReservaId?: string
  ): Promise<boolean> {
    let query = db
      .selectFrom('reservas')
      .select('id')
      .where('veiculo_id', '=', veiculoId)
      .where((eb) =>
        eb.or([
          // Nova reserva começa durante reserva existente
          eb.and([
            eb('start_at', '<=', start),
            eb('end_at', '>', start),
          ]),
          // Nova reserva termina durante reserva existente
          eb.and([
            eb('start_at', '<', end),
            eb('end_at', '>=', end),
          ]),
          // Nova reserva engloba reserva existente
          eb.and([
            eb('start_at', '>=', start),
            eb('end_at', '<=', end),
          ]),
        ])
      );

    if (excludeReservaId) {
      query = query.where('id', '!=', excludeReservaId);
    }

    const overlap = await query.executeTakeFirst();

    return !!overlap;
  }
}

export const reservasService = new ReservasService();