import { Request, Response, NextFunction } from 'express';
import { DispositivosService } from '@/services/dispositivos.service';
import { DispositivoCreateSchema, DispositivoUpdateSchema, DispositivoSensoresSchema, DispositivoVinculoSchema } from '@/validators/dispositivos.schemas';

export class DispositivosController {
  private dispositivosService = new DispositivosService();

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        q: req.query.q as string,
        status: req.query.status as string,
        vinculo: req.query.vinculo as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        size: req.query.size ? parseInt(req.query.size as string) : undefined,
      };
      const dispositivos = await this.dispositivosService.list(filters);
      res.json(dispositivos);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const dispositivo = await this.dispositivosService.findById(req.params.id);
      res.json(dispositivo);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = DispositivoCreateSchema.parse(req.body);
      const dispositivo = await this.dispositivosService.create(body);
      res.status(201).json(dispositivo);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const body = DispositivoUpdateSchema.parse(req.body);
      const dispositivo = await this.dispositivosService.update(req.params.id, body);
      res.json(dispositivo);
    } catch (error) {
      next(error);
    }
  }

  async updateSensores(req: Request, res: Response, next: NextFunction) {
    try {
      const body = DispositivoSensoresSchema.parse(req.body);
      const dispositivo = await this.dispositivosService.updateSensores(req.params.id, body);
      res.json(dispositivo);
    } catch (error) {
      next(error);
    }
  }

  async updateVinculo(req: Request, res: Response, next: NextFunction) {
    try {
      const body = DispositivoVinculoSchema.parse(req.body);
      const dispositivo = await this.dispositivosService.updateVinculo(req.params.id, body.veiculo_id);
      res.json(dispositivo);
    } catch (error) {
      next(error);
    }
  }

  async testar(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.dispositivosService.testar(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}