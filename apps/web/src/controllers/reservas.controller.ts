import { Request, Response, NextFunction } from 'express';
import { ReservasService } from '@/services/reservas.service';
import { ReservaCreateSchema, ReservaUpdateSchema } from '@/validators/reservas.schemas';

export class ReservasController {
  private reservasService = new ReservasService();

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        start: req.query.start as string || new Date().toISOString(),
        end: req.query.end as string || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        veiculo_id: req.query.veiculo_id as string,
        user_id: req.query.user_id as string,
      };
      const reservas = await this.reservasService.list(filters);
      res.json(reservas);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const reserva = await this.reservasService.findById(req.params.id);
      res.json(reserva);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = ReservaCreateSchema.parse(req.body);
      const reserva = await this.reservasService.create(body);
      res.status(201).json(reserva);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const body = ReservaUpdateSchema.parse(req.body);
      const reserva = await this.reservasService.update(req.params.id, body);
      res.json(reserva);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await this.reservasService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}