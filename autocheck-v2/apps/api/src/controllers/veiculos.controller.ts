import { Request, Response } from 'express';
import { veiculosService } from '../services/veiculos.service';
import {
  veiculoCreateSchema,
  veiculoUpdateSchema,
  veiculoFilterSchema,
} from '../validators/veiculos.schemas';

export class VeiculosController {
  async list(req: Request, res: Response) {
    const filters = veiculoFilterSchema.parse(req.query);
    const result = await veiculosService.list(filters);
    res.json(result);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const veiculo = await veiculosService.getById(id);
    res.json(veiculo);
  }

  async create(req: Request, res: Response) {
    const input = veiculoCreateSchema.parse(req.body);
    const veiculo = await veiculosService.create(input);
    res.status(201).json(veiculo);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const input = veiculoUpdateSchema.parse(req.body);
    const veiculo = await veiculosService.update(id, input);
    res.json(veiculo);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    const result = await veiculosService.delete(id);
    res.json(result);
  }

  async toggleAtivo(req: Request, res: Response) {
    const { id } = req.params;
    const veiculo = await veiculosService.toggleAtivo(id);
    res.json(veiculo);
  }
}

export const veiculosController = new VeiculosController();