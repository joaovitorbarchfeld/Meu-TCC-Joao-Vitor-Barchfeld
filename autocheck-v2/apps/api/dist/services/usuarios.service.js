"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usuariosService = exports.UsuariosService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../config/db");
const env_1 = require("../config/env");
const errorHandler_1 = require("../middlewares/errorHandler");
class UsuariosService {
    async list(filters) {
        let query = db_1.db
            .selectFrom('usuarios')
            .select(['id', 'nome', 'email', 'perfil', 'ativo', 'created_at', 'updated_at']);
        // Filtro por busca textual
        if (filters.q) {
            query = query.where((eb) => eb.or([
                eb('nome', 'ilike', `%${filters.q}%`),
                eb('email', 'ilike', `%${filters.q}%`),
            ]));
        }
        // Filtro por perfil
        if (filters.perfil) {
            query = query.where('perfil', '=', filters.perfil);
        }
        // Filtro por ativo
        if (filters.ativo !== undefined) {
            query = query.where('ativo', '=', filters.ativo);
        }
        // Paginação
        const offset = (filters.page - 1) * filters.size;
        query = query.orderBy('nome', 'asc').limit(filters.size).offset(offset);
        const usuarios = await query.execute();
        // Contar total
        let countQuery = db_1.db.selectFrom('usuarios').select(db_1.db.fn.count('id').as('total'));
        if (filters.q) {
            countQuery = countQuery.where((eb) => eb.or([
                eb('nome', 'ilike', `%${filters.q}%`),
                eb('email', 'ilike', `%${filters.q}%`),
            ]));
        }
        if (filters.perfil)
            countQuery = countQuery.where('perfil', '=', filters.perfil);
        if (filters.ativo !== undefined)
            countQuery = countQuery.where('ativo', '=', filters.ativo);
        const countResult = await countQuery.executeTakeFirst();
        const total = Number(countResult?.total || 0);
        return {
            data: usuarios,
            meta: {
                page: filters.page,
                size: filters.size,
                total,
                totalPages: Math.ceil(total / filters.size),
            },
        };
    }
    async getById(id) {
        const usuario = await db_1.db
            .selectFrom('usuarios')
            .select(['id', 'nome', 'email', 'perfil', 'ativo', 'created_at', 'updated_at'])
            .where('id', '=', id)
            .executeTakeFirst();
        if (!usuario) {
            throw new errorHandler_1.AppError(404, 'Usuário não encontrado', 'USUARIO_NOT_FOUND');
        }
        // Buscar estatísticas
        const totalReservas = await db_1.db
            .selectFrom('reservas')
            .select(db_1.db.fn.count('id').as('total'))
            .where('usuario_id', '=', id)
            .executeTakeFirst();
        const reservasAtivas = await db_1.db
            .selectFrom('reservas')
            .select(db_1.db.fn.count('id').as('total'))
            .where('usuario_id', '=', id)
            .where('start_at', '<=', new Date())
            .where('end_at', '>', new Date())
            .executeTakeFirst();
        return {
            ...usuario,
            estatisticas: {
                total_reservas: Number(totalReservas?.total || 0),
                reservas_ativas: Number(reservasAtivas?.total || 0),
            },
        };
    }
    async create(input) {
        // Verificar se email já existe
        const emailExiste = await db_1.db
            .selectFrom('usuarios')
            .select('id')
            .where('email', '=', input.email)
            .executeTakeFirst();
        if (emailExiste) {
            throw new errorHandler_1.AppError(409, 'Email já cadastrado', 'EMAIL_DUPLICADO');
        }
        // Hash da senha
        const senhaHash = await bcrypt_1.default.hash(input.senha, env_1.env.BCRYPT_ROUNDS);
        const usuario = await db_1.db
            .insertInto('usuarios')
            .values({
            nome: input.nome,
            email: input.email.toLowerCase(),
            senha_hash: senhaHash,
            perfil: input.perfil,
            ativo: input.ativo,
        })
            .returning(['id', 'nome', 'email', 'perfil', 'ativo', 'created_at'])
            .executeTakeFirstOrThrow();
        return usuario;
    }
    async update(id, input, usuarioLogadoId, perfilLogado) {
        // Verificar se existe
        const usuarioExistente = await db_1.db
            .selectFrom('usuarios')
            .select(['id', 'perfil'])
            .where('id', '=', id)
            .executeTakeFirst();
        if (!usuarioExistente) {
            throw new errorHandler_1.AppError(404, 'Usuário não encontrado', 'USUARIO_NOT_FOUND');
        }
        // Validar permissões
        // Apenas admin pode alterar perfil
        if (input.perfil && perfilLogado !== 'admin') {
            throw new errorHandler_1.AppError(403, 'Apenas admin pode alterar perfil', 'SEM_PERMISSAO');
        }
        // Apenas admin pode ativar/desativar outros usuários
        if (input.ativo !== undefined && id !== usuarioLogadoId && perfilLogado !== 'admin') {
            throw new errorHandler_1.AppError(403, 'Apenas admin pode ativar/desativar usuários', 'SEM_PERMISSAO');
        }
        // Se alterou email, verificar duplicidade
        if (input.email) {
            const emailExiste = await db_1.db
                .selectFrom('usuarios')
                .select('id')
                .where('email', '=', input.email)
                .where('id', '!=', id)
                .executeTakeFirst();
            if (emailExiste) {
                throw new errorHandler_1.AppError(409, 'Email já cadastrado em outro usuário', 'EMAIL_DUPLICADO');
            }
        }
        const usuario = await db_1.db
            .updateTable('usuarios')
            .set({
            nome: input.nome,
            email: input.email ? input.email.toLowerCase() : undefined,
            perfil: input.perfil,
            ativo: input.ativo,
            updated_at: new Date(),
        })
            .where('id', '=', id)
            .returning(['id', 'nome', 'email', 'perfil', 'ativo', 'updated_at'])
            .executeTakeFirstOrThrow();
        return usuario;
    }
    async delete(id) {
        // Verificar se tem reservas futuras
        const reservasFuturas = await db_1.db
            .selectFrom('reservas')
            .select('id')
            .where('usuario_id', '=', id)
            .where('end_at', '>', new Date())
            .executeTakeFirst();
        if (reservasFuturas) {
            throw new errorHandler_1.AppError(409, 'Não é possível excluir: usuário possui reservas futuras', 'USUARIO_COM_RESERVAS');
        }
        await db_1.db.deleteFrom('usuarios').where('id', '=', id).execute();
        return { message: 'Usuário excluído com sucesso' };
    }
    async trocarSenha(id, input) {
        const usuario = await db_1.db
            .selectFrom('usuarios')
            .select(['id', 'senha_hash'])
            .where('id', '=', id)
            .executeTakeFirst();
        if (!usuario) {
            throw new errorHandler_1.AppError(404, 'Usuário não encontrado', 'USUARIO_NOT_FOUND');
        }
        // Verificar senha atual
        const senhaCorreta = await bcrypt_1.default.compare(input.senha_atual, usuario.senha_hash);
        if (!senhaCorreta) {
            throw new errorHandler_1.AppError(401, 'Senha atual incorreta', 'SENHA_INCORRETA');
        }
        // Hash da nova senha
        const novaSenhaHash = await bcrypt_1.default.hash(input.senha_nova, env_1.env.BCRYPT_ROUNDS);
        await db_1.db
            .updateTable('usuarios')
            .set({
            senha_hash: novaSenhaHash,
            updated_at: new Date(),
        })
            .where('id', '=', id)
            .execute();
        return { message: 'Senha alterada com sucesso' };
    }
    async getMeuPerfil(id) {
        return this.getById(id);
    }
}
exports.UsuariosService = UsuariosService;
exports.usuariosService = new UsuariosService();
//# sourceMappingURL=usuarios.service.js.map