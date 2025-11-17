import { Router } from 'express';
import { authJWT } from '../middlewares/authJWT';
import { dashboardController } from '../controllers/dashboard.controller';

const router = Router();

router.get('/veiculos', authJWT, (req, res, next) => {
  dashboardController.getVeiculos(req, res).catch(next);
});

export default router;
