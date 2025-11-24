import { Request, Response, NextFunction } from 'express';
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
export declare function authJWT(req: Request, res: Response, next: NextFunction): void;
export declare function authorize(...perfisPermitidos: JWTPayload['perfil'][]): (req: Request, res: Response, next: NextFunction) => void;
