import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/auth.service';
import { LoginSchema } from '@/validators/auth.schemas';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { login, password, remember } = LoginSchema.parse(req.body);
      const result = await authService.login(login, password, remember);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}