import { Router } from 'express';
import { authJWT } from '@/middlewares/authJWT';
import { VeiculosController } from '@/controllers/veiculos.controller';

const router = Router();
const veiculosController = new VeiculosController();

router.get('/', authJWT, (req, res, next) => veiculosController.list(req, res, next));
router.get('/:id', authJWT, (req, res, next) => veiculosController.findById(req, res, next));
router.post('/', authJWT, (req, res, next) => veiculosController.create(req, res, next));
router.put('/:id', authJWT, (req, res, next) => veiculosController.update(req, res, next));
router.delete('/:id', authJWT, (req, res, next) => veiculosController.delete(req, res, next));

export { router as veiculosRouter };