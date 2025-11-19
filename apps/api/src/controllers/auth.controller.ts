import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { loginSchema, refreshTokenSchema } from '../validators/auth.schemas';

export class AuthController {
  async login(req: Request, res: Response) {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);
    res.json(result);
  }

  async refresh(req: Request, res: Response) {
    const input = refreshTokenSchema.parse(req.body);
    const result = await authService.refreshToken(input.refresh_token);
    res.json(result);
  }
}

export const authController = new AuthController();
