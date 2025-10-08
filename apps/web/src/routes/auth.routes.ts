import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';

const router = Router();
const authController = new AuthController();

router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/refresh', (req, res, next) => authController.refresh(req, res, next));

export { router as authRouter };