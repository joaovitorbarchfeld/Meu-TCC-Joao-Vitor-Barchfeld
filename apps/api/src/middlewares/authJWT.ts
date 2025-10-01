import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JWTPayload {
    sub: string;
    perfil: string;
    email?: string;
}

export const authJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    console.log('Authorization Header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            code: 'UNAUTHORIZED',
            message: 'Token de acesso requerido'
        });
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_ACCESS_SECRET || 'secret';

    try {
        const payload = jwt.verify(token, secret) as JWTPayload;

        req.user = {
            id: payload.sub,
            perfil: payload.perfil,
            email: payload.email,
        };

        next();
    } catch (error) {
        return res.status(401).json({
            code: 'UNAUTHORIZED',
            message: 'Token inválido ou expirado'
        });
    }
};

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                perfil: string;
                email?: string;
            };
        }
    }
}