import { Request, Response, NextFunction } from 'express';
import { VeiculosService } from '@/services/veiculos.service';
import { VeiculoCreateSchema, VeiculoUpdateSchema } from '@/validators/veiculos.schemas';

const veiculosService = new VeiculosService();

export class VeiculosController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        q: req.query.q as string,
        tipo: req.query.tipo as string,
        ativo: req.query.ativo === 'true' ? true : req.query.ativo === 'false' ? false : undefined,
        page: Number(req.query.page) || 1,
        size: Number(req.query.size) || 25,
      };
      const veiculos = await veiculosService.list(filters);
      res.json(veiculos);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const veiculo = await veiculosService.findById(req.params.id);
      res.json(veiculo);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = VeiculoCreateSchema.parse(req.body);
      const veiculo = await veiculosService.create(data);
      res.status(201).json(veiculo);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = VeiculoUpdateSchema.parse(req.body);
      const veiculo = await veiculosService.update(req.params.id, data);
      res.json(veiculo);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await veiculosService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}