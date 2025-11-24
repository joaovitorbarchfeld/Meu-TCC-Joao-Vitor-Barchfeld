import { Request, Response } from 'express';
export declare class AuthController {
    login(req: Request, res: Response): Promise<void>;
    refresh(req: Request, res: Response): Promise<void>;
}
export declare const authController: AuthController;
