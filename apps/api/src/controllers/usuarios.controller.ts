import { Request, Response } from 'express';
import { usuariosService } from '../services/usuarios.service';
import {
  usuarioCreateSchema,
  usuarioUpdateSchema,
  usuarioTrocarSenhaSchema,
  usuarioFilterSchema,
} from '../validators/usuarios.schemas';

export class UsuariosController {
  async list(req: Request, res: Response) {
    const filters = usuarioFilterSchema.parse(req.query);
    const result = await usuariosService.list(filters);
    res.json(result);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const usuario = await usuariosService.getById(id);
    res.json(usuario);
  }

  async create(req: Request, res: Response) {
    const input = usuarioCreateSchema.parse(req.body);
    const usuario = await usuariosService.create(input);
    res.status(201).json(usuario);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const input = usuarioUpdateSchema.parse(req.body);
    const usuario = await usuariosService.update(
      id,
      input,
      req.user!.userId,
      req.user!.perfil
    );
    res.json(usuario);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    const result = await usuariosService.delete(id);
    res.json(result);
  }

  async trocarSenha(req: Request, res: Response) {
    const { id } = req.params;
    const input = usuarioTrocarSenhaSchema.parse(req.body);
    
    // Só pode trocar a própria senha
    if (id !== req.user!.userId) {
      return res.status(403).json({ error: 'Você só pode trocar sua própria senha' });
    }

    const result = await usuariosService.trocarSenha(id, input);
    res.json(result);
  }

  async getMeuPerfil(req: Request, res: Response) {
    const usuario = await usuariosService.getMeuPerfil(req.user!.userId);
    res.json(usuario);
  }
}

export const usuariosController = new UsuariosController();