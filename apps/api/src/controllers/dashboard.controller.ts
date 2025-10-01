import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '@/services/dashboard.service';

const dashboardService = new DashboardService();

export class DashboardController {
  async getVehicles(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicles = await dashboardService.getVehiclesWithStatus();
      res.json(vehicles);
    } catch (error) {
      next(error);
    }
  }
}