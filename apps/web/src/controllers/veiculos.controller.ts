import { Request, Response, NextFunction } from 'express';
import { VeiculosService } from '@/services/veiculos.service';
import { VeiculoCreateSchema, VeiculoUpdateSchema } from '@/validators/veiculos.schemas';

export class VeiculosController {
  private veiculosService = new VeiculosService();

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        q: req.query.q as string,
        tipo: req.query.tipo as string,
        ativo: req.query.ativo === 'true' ? true : req.query.ativo === 'false' ? false : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        size: req.query.size ? parseInt(req.query.size as string) : undefined,
      };
      const veiculos = await this.veiculosService.list(filters);
      res.json(veiculos);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const veiculo = await this.veiculosService.findById(req.params.id);
      res.json(veiculo);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = VeiculoCreateSchema.parse(req.body);
      const veiculo = await this.veiculosService.create(body);
      res.status(201).json(veiculo);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const body = VeiculoUpdateSchema.parse(req.body);
      const veiculo = await this.veiculosService.update(req.params.id, body);
      res.json(veiculo);
    } catch (error) {
      next(error);
    }
  }

  async toggleActive(req: Request, res: Response, next: NextFunction) {
    try {
      const current = await this.veiculosService.findById(req.params.id);
      const veiculo = await this.veiculosService.update(req.params.id, { ativo: !current.ativo });
      res.json(veiculo);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await this.veiculosService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}