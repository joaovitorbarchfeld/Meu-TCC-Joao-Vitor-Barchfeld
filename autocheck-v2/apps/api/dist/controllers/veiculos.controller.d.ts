import { Request, Response } from 'express';
export declare class VeiculosController {
    list(req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<void>;
    create(req: Request, res: Response): Promise<void>;
    update(req: Request, res: Response): Promise<void>;
    delete(req: Request, res: Response): Promise<void>;
    toggleAtivo(req: Request, res: Response): Promise<void>;
}
export declare const veiculosController: VeiculosController;
