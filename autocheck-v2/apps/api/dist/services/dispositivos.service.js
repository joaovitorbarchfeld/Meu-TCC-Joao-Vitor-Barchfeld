"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dispositivosService = exports.DispositivosService = void 0;
const db_1 = require("../config/db");
const errorHandler_1 = require("../middlewares/errorHandler");
class DispositivosService {
    async list(filters) {
        let query = db_1.db
            .selectFrom('dispositivos')
            .leftJoin('veiculos', 'dispositivos.veiculo_id', 'veiculos.id')
            .select([
            'dispositivos.id',
            'dispositivos.identificador',
            'dispositivos.descricao',
            'dispositivos.veiculo_id',
            'dispositivos.ativo',
            'dispositivos.created_at',
            'dispositivos.updated_at',
            'veiculos.nome as veiculo_nome',
            'veiculos.placa as veiculo_placa',
        ]);
        // Filtro por busca textual
        if (filters.q) {
            query = query.where((eb) => eb.or([
                eb('dispositivos.identificador', 'ilike', `%${filters.q}%`),
                eb('dispositivos.descricao', 'ilike', `%${filters.q}%`),
            ]));
        }
        // Filtro por ativo
        if (filters.ativo !== undefined) {
            query = query.where('dispositivos.ativo', '=', filters.ativo);
        }
        // Filtro por vinculação a veículo
        if (filters.com_veiculo !== undefined) {
            if (filters.com_veiculo) {
                query = query.where('dispositivos.veiculo_id', 'is not', null);
            }
            else {
                query = query.where('dispositivos.veiculo_id', 'is', null);
            }
        }
        // Paginação
        const offset = (filters.page - 1) * filters.size;
        query = query.orderBy('dispositivos.identificador', 'asc').limit(filters.size).offset(offset);
        const dispositivos = await query.execute();
        // Contar total
        let countQuery = db_1.db.selectFrom('dispositivos').select(db_1.db.fn.count('id').as('total'));
        if (filters.q) {
            countQuery = countQuery.where((eb) => eb.or([
                eb('identificador', 'ilike', `%${filters.q}%`),
                eb('descricao', 'ilike', `%${filters.q}%`),
            ]));
        }
        if (filters.ativo !== undefined)
            countQuery = countQuery.where('ativo', '=', filters.ativo);
        if (filters.com_veiculo !== undefined) {
            if (filters.com_veiculo) {
                countQuery = countQuery.where('veiculo_id', 'is not', null);
            }
            else {
                countQuery = countQuery.where('veiculo_id', 'is', null);
            }
        }
        const countResult = await countQuery.executeTakeFirst();
        const total = Number(countResult?.total || 0);
        return {
            data: dispositivos,
            meta: {
                page: filters.page,
                size: filters.size,
                total,
                totalPages: Math.ceil(total / filters.size),
            },
        };
    }
    async getById(id) {
        const dispositivo = await db_1.db
            .selectFrom('dispositivos')
            .leftJoin('veiculos', 'dispositivos.veiculo_id', 'veiculos.id')
            .select([
            'dispositivos.id',
            'dispositivos.identificador',
            'dispositivos.descricao',
            'dispositivos.veiculo_id',
            'dispositivos.ativo',
            'dispositivos.created_at',
            'dispositivos.updated_at',
            'veiculos.nome as veiculo_nome',
            'veiculos.placa as veiculo_placa',
            'veiculos.tipo as veiculo_tipo',
            'veiculos.cor_hex as veiculo_cor',
        ])
            .where('dispositivos.id', '=', id)
            .executeTakeFirst();
        if (!dispositivo) {
            throw new errorHandler_1.AppError(404, 'Dispositivo não encontrado', 'DISPOSITIVO_NOT_FOUND');
        }
        return dispositivo;
    }
    async create(input) {
        // Verificar se identificador já existe
        const identificadorExiste = await db_1.db
            .selectFrom('dispositivos')
            .select('id')
            .where('identificador', '=', input.identificador)
            .executeTakeFirst();
        if (identificadorExiste) {
            throw new errorHandler_1.AppError(409, 'Identificador já cadastrado', 'IDENTIFICADOR_DUPLICADO');
        }
        // Se for vincular a um veículo, verificar se existe
        if (input.veiculo_id) {
            const veiculo = await db_1.db
                .selectFrom('veiculos')
                .select('id')
                .where('id', '=', input.veiculo_id)
                .executeTakeFirst();
            if (!veiculo) {
                throw new errorHandler_1.AppError(404, 'Veículo não encontrado', 'VEICULO_NOT_FOUND');
            }
            // Verificar se veículo já tem dispositivo
            const veiculoTemDispositivo = await db_1.db
                .selectFrom('dispositivos')
                .select('id')
                .where('veiculo_id', '=', input.veiculo_id)
                .where('ativo', '=', true)
                .executeTakeFirst();
            if (veiculoTemDispositivo) {
                throw new errorHandler_1.AppError(409, 'Este veículo já possui um dispositivo vinculado', 'VEICULO_JA_TEM_DISPOSITIVO');
            }
        }
        const dispositivo = await db_1.db
            .insertInto('dispositivos')
            .values({
            identificador: input.identificador,
            descricao: input.descricao || null,
            veiculo_id: input.veiculo_id || null,
            ativo: input.ativo,
        })
            .returningAll()
            .executeTakeFirstOrThrow();
        return dispositivo;
    }
    async update(id, input) {
        // Verificar se existe
        const existe = await db_1.db
            .selectFrom('dispositivos')
            .select('id')
            .where('id', '=', id)
            .executeTakeFirst();
        if (!existe) {
            throw new errorHandler_1.AppError(404, 'Dispositivo não encontrado', 'DISPOSITIVO_NOT_FOUND');
        }
        // Se alterou identificador, verificar duplicidade
        if (input.identificador) {
            const identificadorExiste = await db_1.db
                .selectFrom('dispositivos')
                .select('id')
                .where('identificador', '=', input.identificador)
                .where('id', '!=', id)
                .executeTakeFirst();
            if (identificadorExiste) {
                throw new errorHandler_1.AppError(409, 'Identificador já cadastrado em outro dispositivo', 'IDENTIFICADOR_DUPLICADO');
            }
        }
        const dispositivo = await db_1.db
            .updateTable('dispositivos')
            .set({
            identificador: input.identificador,
            descricao: input.descricao !== undefined ? input.descricao : undefined,
            ativo: input.ativo,
            updated_at: new Date(),
        })
            .where('id', '=', id)
            .returningAll()
            .executeTakeFirstOrThrow();
        return dispositivo;
    }
    async delete(id) {
        const dispositivo = await db_1.db
            .selectFrom('dispositivos')
            .select(['id', 'veiculo_id'])
            .where('id', '=', id)
            .executeTakeFirst();
        if (!dispositivo) {
            throw new errorHandler_1.AppError(404, 'Dispositivo não encontrado', 'DISPOSITIVO_NOT_FOUND');
        }
        await db_1.db.deleteFrom('dispositivos').where('id', '=', id).execute();
        return { message: 'Dispositivo excluído com sucesso' };
    }
    async vincular(id, input) {
        const dispositivo = await db_1.db
            .selectFrom('dispositivos')
            .select(['id', 'veiculo_id', 'ativo'])
            .where('id', '=', id)
            .executeTakeFirst();
        if (!dispositivo) {
            throw new errorHandler_1.AppError(404, 'Dispositivo não encontrado', 'DISPOSITIVO_NOT_FOUND');
        }
        if (!dispositivo.ativo) {
            throw new errorHandler_1.AppError(400, 'Dispositivo está inativo', 'DISPOSITIVO_INATIVO');
        }
        // Verificar se veículo existe
        const veiculo = await db_1.db
            .selectFrom('veiculos')
            .select(['id', 'ativo'])
            .where('id', '=', input.veiculo_id)
            .executeTakeFirst();
        if (!veiculo) {
            throw new errorHandler_1.AppError(404, 'Veículo não encontrado', 'VEICULO_NOT_FOUND');
        }
        // Verificar se veículo já tem dispositivo
        const veiculoTemDispositivo = await db_1.db
            .selectFrom('dispositivos')
            .select('id')
            .where('veiculo_id', '=', input.veiculo_id)
            .where('ativo', '=', true)
            .where('id', '!=', id)
            .executeTakeFirst();
        if (veiculoTemDispositivo) {
            throw new errorHandler_1.AppError(409, 'Este veículo já possui outro dispositivo vinculado', 'VEICULO_JA_TEM_DISPOSITIVO');
        }
        const atualizado = await db_1.db
            .updateTable('dispositivos')
            .set({ veiculo_id: input.veiculo_id, updated_at: new Date() })
            .where('id', '=', id)
            .returningAll()
            .executeTakeFirstOrThrow();
        return atualizado;
    }
    async desvincular(id) {
        const dispositivo = await db_1.db
            .selectFrom('dispositivos')
            .select(['id', 'veiculo_id'])
            .where('id', '=', id)
            .executeTakeFirst();
        if (!dispositivo) {
            throw new errorHandler_1.AppError(404, 'Dispositivo não encontrado', 'DISPOSITIVO_NOT_FOUND');
        }
        if (!dispositivo.veiculo_id) {
            throw new errorHandler_1.AppError(400, 'Dispositivo não está vinculado a nenhum veículo', 'DISPOSITIVO_NAO_VINCULADO');
        }
        const atualizado = await db_1.db
            .updateTable('dispositivos')
            .set({ veiculo_id: null, updated_at: new Date() })
            .where('id', '=', id)
            .returningAll()
            .executeTakeFirstOrThrow();
        return atualizado;
    }
    // ENDPOINT CRÍTICO: Validação para ESP32
    async validar(input) {
        // Buscar dispositivo
        const dispositivo = await db_1.db
            .selectFrom('dispositivos')
            .select(['id', 'identificador', 'veiculo_id', 'ativo'])
            .where('identificador', '=', input.identificador)
            .executeTakeFirst();
        if (!dispositivo) {
            return {
                permitido: false,
                mensagem: 'Dispositivo não cadastrado',
                codigo: 'DISPOSITIVO_NAO_CADASTRADO',
            };
        }
        if (!dispositivo.ativo) {
            return {
                permitido: false,
                mensagem: 'Dispositivo inativo',
                codigo: 'DISPOSITIVO_INATIVO',
            };
        }
        // Buscar veículo pela placa
        const veiculo = await db_1.db
            .selectFrom('veiculos')
            .select(['id', 'nome', 'ativo'])
            .where('placa', '=', input.placa.toUpperCase())
            .executeTakeFirst();
        if (!veiculo) {
            return {
                permitido: false,
                mensagem: 'Veículo não cadastrado',
                codigo: 'VEICULO_NAO_CADASTRADO',
            };
        }
        if (!veiculo.ativo) {
            return {
                permitido: false,
                mensagem: 'Veículo inativo',
                codigo: 'VEICULO_INATIVO',
            };
        }
        // Verificar reserva ativa no momento
        const agora = new Date();
        const reservaAtiva = await db_1.db
            .selectFrom('reservas')
            .innerJoin('usuarios', 'reservas.usuario_id', 'usuarios.id')
            .select([
            'reservas.id',
            'reservas.start_at',
            'reservas.end_at',
            'reservas.motivo',
            'usuarios.nome as usuario_nome',
            'usuarios.email as usuario_email',
        ])
            .where('reservas.veiculo_id', '=', veiculo.id)
            .where('reservas.start_at', '<=', agora)
            .where('reservas.end_at', '>', agora)
            .executeTakeFirst();
        if (reservaAtiva) {
            // Registrar auditoria de acesso permitido
            await db_1.db
                .insertInto('auditoria_logs')
                .values({
                dispositivo_id: dispositivo.id,
                veiculo_id: veiculo.id,
                usuario_id: null,
                acao: 'ACESSO_PERMITIDO',
                detalhes: {
                    placa: input.placa,
                    reserva_id: reservaAtiva.id,
                    usuario: reservaAtiva.usuario_nome,
                },
            })
                .execute();
            return {
                permitido: true,
                mensagem: 'Acesso autorizado',
                codigo: 'ACESSO_AUTORIZADO',
                reserva: {
                    usuario_nome: reservaAtiva.usuario_nome,
                    usuario_email: reservaAtiva.usuario_email,
                    inicio: reservaAtiva.start_at,
                    fim: reservaAtiva.end_at,
                    motivo: reservaAtiva.motivo,
                },
                veiculo: {
                    nome: veiculo.nome,
                },
            };
        }
        // Registrar auditoria de acesso negado
        await db_1.db
            .insertInto('auditoria_logs')
            .values({
            dispositivo_id: dispositivo.id,
            veiculo_id: veiculo.id,
            usuario_id: null,
            acao: 'ACESSO_NEGADO',
            detalhes: {
                placa: input.placa,
                motivo: 'Sem reserva ativa',
            },
        })
            .execute();
        return {
            permitido: false,
            mensagem: 'Sem reserva ativa no momento',
            codigo: 'SEM_RESERVA_ATIVA',
            veiculo: {
                nome: veiculo.nome,
            },
        };
    }
}
exports.DispositivosService = DispositivosService;
exports.dispositivosService = new DispositivosService();
//# sourceMappingURL=dispositivos.service.js.map