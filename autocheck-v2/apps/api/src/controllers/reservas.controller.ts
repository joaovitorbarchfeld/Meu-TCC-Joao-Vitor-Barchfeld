import { Request, Response } from 'express';
import { reservasService } from '../services/reservas.service';
import {
  reservaCreateSchema,
  reservaUpdateSchema,
  reservaFilterSchema,
  reservaCalendarioSchema,
} from '../validators/reservas.schemas';

export class ReservasController {
  async list(req: Request, res: Response) {
    const filters = reservaFilterSchema.parse(req.query);
    const result = await reservasService.list(filters, req.user?.userId);
    res.json(result);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const reserva = await reservasService.getById(id);
    res.json(reserva);
  }

  async create(req: Request, res: Response) {
    const input = reservaCreateSchema.parse(req.body);
    const reserva = await reservasService.create(input, req.user!.userId);
    res.status(201).json(reserva);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const input = reservaUpdateSchema.parse(req.body);
    const reserva = await reservasService.update(
      id,
      input,
      req.user!.userId,
      req.user!.perfil
    );
    res.json(reserva);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    const result = await reservasService.delete(id, req.user!.userId, req.user!.perfil);
    res.json(result);
  }

  async getMinhas(req: Request, res: Response) {
    const { status } = req.query;
    const result = await reservasService.getMinhasReservas(
      req.user!.userId,
      status as any || 'todas'
    );
    res.json(result);
  }

  async getCalendario(req: Request, res: Response) {
    const filters = reservaCalendarioSchema.parse(req.query);
    const reservas = await reservasService.getCalendario(filters);
    res.json(reservas);
  }
}

export const reservasController = new ReservasController();