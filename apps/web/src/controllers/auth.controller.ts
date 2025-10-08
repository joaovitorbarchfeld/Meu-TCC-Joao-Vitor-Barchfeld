import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/auth.service';
import { LoginSchema, RefreshTokenSchema } from '@/validators/auth.schemas';

export class AuthController {
  private authService = new AuthService();

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const body = LoginSchema.parse(req.body);
      const result = await this.authService.login(body.login, body.password, body.remember);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const body = RefreshTokenSchema.parse(req.body);
      const result = await this.authService.refresh(body.refresh_token);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}