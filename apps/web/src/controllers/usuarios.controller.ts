import { Request, Response, NextFunction } from 'express';
import { UsuariosService } from '@/services/usuarios.service';
import { UsuarioCreateSchema, UsuarioUpdateSchema } from '@/validators/usuarios.schemas';

const usuariosService = new UsuariosService();

export class UsuariosController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        q: req.query.q as string,
        perfil: req.query.perfil as string,
        ativo: req.query.ativo === 'true' ? true : req.query.ativo === 'false' ? false : undefined,
        page: Number(req.query.page) || 1,
        size: Number(req.query.size) || 25,
      };
      const usuarios = await usuariosService.list(filters);
      res.json(usuarios);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = await usuariosService.findById(req.params.id);
      res.json(usuario);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = UsuarioCreateSchema.parse(req.body);
      const usuario = await usuariosService.create(data);
      res.status(201).json(usuario);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = UsuarioUpdateSchema.parse(req.body);
      const usuario = await usuariosService.update(req.params.id, data);
      res.json(usuario);
    } catch (error) {
      next(error);
    }
  }

  async toggleActive(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = await usuariosService.toggleActive(req.params.id);
      res.json(usuario);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await usuariosService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}