import { Request, Response, NextFunction } from 'express';
import { ReservasService } from '@/services/reservas.service';
import { ReservaCreateSchema, ReservaUpdateSchema } from '@/validators/reservas.schemas';

const reservasService = new ReservasService();

export class ReservasController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        start: req.query.start as string,
        end: req.query.end as string,
        veiculo_id: req.query.veiculo_id as string,
        user_id: req.query.user_id as string,
      };
      const reservas = await reservasService.list(filters);
      res.json(reservas);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const reserva = await reservasService.findById(req.params.id);
      res.json(reserva);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = ReservaCreateSchema.parse(req.body);
      const reserva = await reservasService.create(data);
      res.status(201).json(reserva);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = ReservaUpdateSchema.parse(req.body);
      const reserva = await reservasService.update(req.params.id, data);
      res.json(reserva);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await reservasService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}