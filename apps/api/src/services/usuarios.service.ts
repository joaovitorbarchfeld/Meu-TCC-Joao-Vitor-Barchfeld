import bcrypt from 'bcrypt';
import { db } from '../config/db';
import { env } from '../config/env';
import { AppError } from '../middlewares/errorHandler';
import type {
  UsuarioCreateInput,
  UsuarioUpdateInput,
  UsuarioTrocarSenhaInput,
  UsuarioFilter,
} from '../validators/usuarios.schemas';

export class UsuariosService {
  async list(filters: UsuarioFilter) {
    let query = db
      .selectFrom('usuarios')
      .select(['id', 'nome', 'email', 'perfil', 'ativo', 'created_at', 'updated_at']);

    // Filtro por busca textual
    if (filters.q) {
      query = query.where((eb) =>
        eb.or([
          eb('nome', 'ilike', `%${filters.q}%`),
          eb('email', 'ilike', `%${filters.q}%`),
        ])
      );
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
    let countQuery = db.selectFrom('usuarios').select(db.fn.count('id').as('total'));
    
    if (filters.q) {
      countQuery = countQuery.where((eb) =>
        eb.or([
          eb('nome', 'ilike', `%${filters.q}%`),
          eb('email', 'ilike', `%${filters.q}%`),
        ])
      );
    }
    if (filters.perfil) countQuery = countQuery.where('perfil', '=', filters.perfil);
    if (filters.ativo !== undefined) countQuery = countQuery.where('ativo', '=', filters.ativo);

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

  async getById(id: string) {
    const usuario = await db
      .selectFrom('usuarios')
      .select(['id', 'nome', 'email', 'perfil', 'ativo', 'created_at', 'updated_at'])
      .where('id', '=', id)
      .executeTakeFirst();

    if (!usuario) {
      throw new AppError(404, 'Usuário não encontrado', 'USUARIO_NOT_FOUND');
    }

    // Buscar estatísticas
    const totalReservas = await db
      .selectFrom('reservas')
      .select(db.fn.count('id').as('total'))
      .where('usuario_id', '=', id)
      .executeTakeFirst();

    const reservasAtivas = await db
      .selectFrom('reservas')
      .select(db.fn.count('id').as('total'))
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

  async create(input: UsuarioCreateInput) {
    // Verificar se email já existe
    const emailExiste = await db
      .selectFrom('usuarios')
      .select('id')
      .where('email', '=', input.email)
      .executeTakeFirst();

    if (emailExiste) {
      throw new AppError(409, 'Email já cadastrado', 'EMAIL_DUPLICADO');
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(input.senha, env.BCRYPT_ROUNDS);

    const usuario = await db
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

  async update(id: string, input: UsuarioUpdateInput, usuarioLogadoId: string, perfilLogado: string) {
    // Verificar se existe
    const usuarioExistente = await db
      .selectFrom('usuarios')
      .select(['id', 'perfil'])
      .where('id', '=', id)
      .executeTakeFirst();

    if (!usuarioExistente) {
      throw new AppError(404, 'Usuário não encontrado', 'USUARIO_NOT_FOUND');
    }

    // Validar permissões
    // Apenas admin pode alterar perfil
    if (input.perfil && perfilLogado !== 'admin') {
      throw new AppError(403, 'Apenas admin pode alterar perfil', 'SEM_PERMISSAO');
    }

    // Apenas admin pode ativar/desativar outros usuários
    if (input.ativo !== undefined && id !== usuarioLogadoId && perfilLogado !== 'admin') {
      throw new AppError(403, 'Apenas admin pode ativar/desativar usuários', 'SEM_PERMISSAO');
    }

    // Se alterou email, verificar duplicidade
    if (input.email) {
      const emailExiste = await db
        .selectFrom('usuarios')
        .select('id')
        .where('email', '=', input.email)
        .where('id', '!=', id)
        .executeTakeFirst();

      if (emailExiste) {
        throw new AppError(409, 'Email já cadastrado em outro usuário', 'EMAIL_DUPLICADO');
      }
    }

    const usuario = await db
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

  async delete(id: string) {
    // Verificar se tem reservas futuras
    const reservasFuturas = await db
      .selectFrom('reservas')
      .select('id')
      .where('usuario_id', '=', id)
      .where('end_at', '>', new Date())
      .executeTakeFirst();

    if (reservasFuturas) {
      throw new AppError(
        409,
        'Não é possível excluir: usuário possui reservas futuras',
        'USUARIO_COM_RESERVAS'
      );
    }

    await db.deleteFrom('usuarios').where('id', '=', id).execute();

    return { message: 'Usuário excluído com sucesso' };
  }

  async trocarSenha(id: string, input: UsuarioTrocarSenhaInput) {
    const usuario = await db
      .selectFrom('usuarios')
      .select(['id', 'senha_hash'])
      .where('id', '=', id)
      .executeTakeFirst();

    if (!usuario) {
      throw new AppError(404, 'Usuário não encontrado', 'USUARIO_NOT_FOUND');
    }

    // Verificar senha atual
    const senhaCorreta = await bcrypt.compare(input.senha_atual, usuario.senha_hash);

    if (!senhaCorreta) {
      throw new AppError(401, 'Senha atual incorreta', 'SENHA_INCORRETA');
    }

    // Hash da nova senha
    const novaSenhaHash = await bcrypt.hash(input.senha_nova, env.BCRYPT_ROUNDS);

    await db
      .updateTable('usuarios')
      .set({
        senha_hash: novaSenhaHash,
        updated_at: new Date(),
      })
      .where('id', '=', id)
      .execute();

    return { message: 'Senha alterada com sucesso' };
  }

  async getMeuPerfil(id: string) {
    return this.getById(id);
  }
}

export const usuariosService = new UsuariosService();