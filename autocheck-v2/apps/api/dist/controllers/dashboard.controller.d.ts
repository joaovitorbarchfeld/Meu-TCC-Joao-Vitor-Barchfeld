import { Request, Response } from 'express';
export declare class DashboardController {
    getVeiculos(req: Request, res: Response): Promise<void>;
}
export declare const dashboardController: DashboardController;
