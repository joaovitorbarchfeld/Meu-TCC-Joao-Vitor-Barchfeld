import { Router } from 'express';
import { authJWT } from '@/middlewares/authJWT';
import { RelatoriosController } from '@/controllers/relatorios.controller';

const router = Router();
const relatoriosController = new RelatoriosController();

router.get('/kpis', authJWT, (req, res, next) => relatoriosController.getKPIs(req, res, next));
router.get('/series', authJWT, (req, res, next) => relatoriosController.getSeries(req, res, next));
router.get('/veiculos', authJWT, (req, res, next) => relatoriosController.getVeiculos(req, res, next));
router.get('/export.csv', authJWT, (req, res, next) => relatoriosController.exportCSV(req, res, next));

export { router as relatoriosRouter };