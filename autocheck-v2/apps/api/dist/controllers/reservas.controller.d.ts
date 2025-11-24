import { Request, Response } from 'express';
export declare class ReservasController {
    list(req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<void>;
    create(req: Request, res: Response): Promise<void>;
    update(req: Request, res: Response): Promise<void>;
    delete(req: Request, res: Response): Promise<void>;
    getMinhas(req: Request, res: Response): Promise<void>;
    getCalendario(req: Request, res: Response): Promise<void>;
}
export declare const reservasController: ReservasController;
