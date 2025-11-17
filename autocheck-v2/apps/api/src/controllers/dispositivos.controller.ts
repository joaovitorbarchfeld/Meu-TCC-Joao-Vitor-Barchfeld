import { Request, Response } from 'express';
import { dispositivosService } from '../services/dispositivos.service';
import {
  dispositivoCreateSchema,
  dispositivoUpdateSchema,
  dispositivoVincularSchema,
  dispositivoValidarSchema,
  dispositivoFilterSchema,
} from '../validators/dispositivos.schemas';

export class DispositivosController {
  async list(req: Request, res: Response) {
    const filters = dispositivoFilterSchema.parse(req.query);
    const result = await dispositivosService.list(filters);
    res.json(result);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const dispositivo = await dispositivosService.getById(id);
    res.json(dispositivo);
  }

  async create(req: Request, res: Response) {
    const input = dispositivoCreateSchema.parse(req.body);
    const dispositivo = await dispositivosService.create(input);
    res.status(201).json(dispositivo);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const input = dispositivoUpdateSchema.parse(req.body);
    const dispositivo = await dispositivosService.update(id, input);
    res.json(dispositivo);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    const result = await dispositivosService.delete(id);
    res.json(result);
  }

  async vincular(req: Request, res: Response) {
    const { id } = req.params;
    const input = dispositivoVincularSchema.parse(req.body);
    const dispositivo = await dispositivosService.vincular(id, input);
    res.json(dispositivo);
  }

  async desvincular(req: Request, res: Response) {
    const { id } = req.params;
    const dispositivo = await dispositivosService.desvincular(id);
    res.json(dispositivo);
  }

  async validar(req: Request, res: Response) {
    const input = dispositivoValidarSchema.parse(req.body);
    const result = await dispositivosService.validar(input);
    res.json(result);
  }
}

export const dispositivosController = new DispositivosController();