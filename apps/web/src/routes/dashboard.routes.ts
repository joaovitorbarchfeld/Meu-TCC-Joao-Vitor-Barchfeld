import { Router } from 'express';
import { authJWT } from '@/middlewares/authJWT';
import { DashboardController } from '@/controllers/dashboard.controller';

const router = Router();
const dashboardController = new DashboardController();

router.get('/veiculos', authJWT, (req, res, next) => dashboardController.getVehicles(req, res, next));

export { router as dashboardRouter };