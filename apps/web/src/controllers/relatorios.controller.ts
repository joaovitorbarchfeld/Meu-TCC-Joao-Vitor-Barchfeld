import { Request, Response, NextFunction } from 'express';
import { RelatoriosService } from '@/services/relatorios.service';

export class RelatoriosController {
  private relatoriosService = new RelatoriosService();

  async getKPIs(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        start: req.query.start as string || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: req.query.end as string || new Date().toISOString(),
        vehicle_id: req.query.vehicle_id as string,
        user_id: req.query.user_id as string,
      };
      const kpis = await this.relatoriosService.getKPIs(filters);
      res.json(kpis);
    } catch (error) {
      next(error);
    }
  }

  async getSeries(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        start: req.query.start as string || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: req.query.end as string || new Date().toISOString(),
        vehicle_id: req.query.vehicle_id as string,
        user_id: req.query.user_id as string,
      };
      const series = await this.relatoriosService.getSeries(filters);
      res.json(series);
    } catch (error) {
      next(error);
    }
  }

  async getVeiculos(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        start: req.query.start as string || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: req.query.end as string || new Date().toISOString(),
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        size: req.query.size ? parseInt(req.query.size as string) : undefined,
      };
      const veiculos = await this.relatoriosService.getVeiculos(filters);
      res.json(veiculos);
    } catch (error) {
      next(error);
    }
  }

  async exportCSV(req: Request, res: Response, next: NextFunction) {
    try {
      // Mock CSV
      const csv = 'veiculo,placa,reservas,tempo_h\nCelta Prata,IQI-1234,15,45.5\n';
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=relatorio.csv');
      res.send(csv);
    } catch (error) {
      next(error);
    }
  }
}