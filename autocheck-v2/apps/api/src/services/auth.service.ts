import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../config/db';
import { env } from '../config/env';
import { AppError } from '../middlewares/errorHandler';
import type { LoginInput } from '../validators/auth.schemas';
import type { JWTPayload } from '../middlewares/authJWT';

export class AuthService {
  async login(input: LoginInput) {
    const user = await db
      .selectFrom('usuarios')
      .selectAll()
      .where('email', '=', input.login)
      .where('ativo', '=', true)
      .executeTakeFirst();

    if (!user) {
      throw new AppError(401, 'Credenciais inválidas', 'INVALID_CREDENTIALS');
    }

    const passwordMatch = await bcrypt.compare(input.password, user.senha_hash);

    if (!passwordMatch) {
      throw new AppError(401, 'Credenciais inválidas', 'INVALID_CREDENTIALS');
    }

    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      perfil: user.perfil,
    };

    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    });

    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await db
      .insertInto('auth_refresh_tokens')
      .values({
        usuario_id: user.id,
        token_hash: refreshTokenHash,
        expires_at: expiresAt,
      })
      .execute();

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil: user.perfil,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as JWTPayload;

      const payload: JWTPayload = {
        userId: decoded.userId,
        email: decoded.email,
        perfil: decoded.perfil,
      };

      const newAccessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
        expiresIn: env.JWT_ACCESS_EXPIRES_IN,
      });

      return { access_token: newAccessToken };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError(401, 'Refresh token expirado', 'REFRESH_TOKEN_EXPIRED');
      }
      throw error;
    }
  }
}

export const authService = new AuthService();
