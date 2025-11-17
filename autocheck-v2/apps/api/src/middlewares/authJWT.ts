import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './errorHandler';

export interface JWTPayload {
  userId: string;
  email: string;
  perfil: 'colaborador' | 'gestor' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export function authJWT(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError(401, 'Token não fornecido', 'MISSING_TOKEN');
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new AppError(401, 'Formato de token inválido', 'INVALID_TOKEN_FORMAT');
    }

    const token = parts[1];
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JWTPayload;

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError(401, 'Token expirado', 'TOKEN_EXPIRED');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError(401, 'Token inválido', 'INVALID_TOKEN');
    }
    throw error;
  }
}

export function authorize(...perfisPermitidos: JWTPayload['perfil'][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(401, 'Não autenticado', 'NOT_AUTHENTICATED');
    }

    if (!perfisPermitidos.includes(req.user.perfil)) {
      throw new AppError(403, 'Sem permissão', 'FORBIDDEN');
    }

    next();
  };
}
