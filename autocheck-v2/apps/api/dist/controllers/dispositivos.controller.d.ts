import { Request, Response } from 'express';
export declare class DispositivosController {
    list(req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<void>;
    create(req: Request, res: Response): Promise<void>;
    update(req: Request, res: Response): Promise<void>;
    delete(req: Request, res: Response): Promise<void>;
    vincular(req: Request, res: Response): Promise<void>;
    desvincular(req: Request, res: Response): Promise<void>;
    validar(req: Request, res: Response): Promise<void>;
}
export declare const dispositivosController: DispositivosController;
