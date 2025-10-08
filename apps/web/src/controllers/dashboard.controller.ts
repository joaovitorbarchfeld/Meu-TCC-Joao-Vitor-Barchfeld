import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '@/services/dashboard.service';

export class DashboardController {
  private dashboardService = new DashboardService();

  async getVehicles(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicles = await this.dashboardService.getVehiclesWithStatus();
      res.json(vehicles);
    } catch (error) {
      next(error);
    }
  }
}