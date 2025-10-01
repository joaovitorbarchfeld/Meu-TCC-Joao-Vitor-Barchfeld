import jwt from 'jsonwebtoken';
import { db } from '@/config/db';
import { AppError } from '@/middlewares/errorHandler';

export class AuthService {
  async login(login: string, password: string, remember?: boolean) {
    // Buscar usuário
    const user = await db
      .selectFrom('usuarios')
      .selectAll()
      .where((eb) => 
        eb.or([
          eb('email', '=', login),
          eb('cpf', '=', login),
        ])
      )
      .where('ativo', '=', true)
      .executeTakeFirst();

    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Credenciais inválidas');
    }

    // TODO: Verificar senha com bcrypt
    // Por enquanto, senha hardcoded para desenvolvimento
    if (password !== 'autocheck123') {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Credenciais inválidas');
    }

    const secret = process.env.JWT_ACCESS_SECRET || 'secret';
    
    const accessToken = jwt.sign(
      {
        sub: user.id,
        perfil: user.perfil,
        email: user.email,
      },
      secret,
      { expiresIn: '15m' }
    );

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil: user.perfil,
      },
    };
  }
}