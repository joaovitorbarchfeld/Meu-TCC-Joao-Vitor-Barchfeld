import { Router } from 'express';
import { authJWT } from '@/middlewares/authJWT';
import { DispositivosController } from '@/controllers/dispositivos.controller';

const router = Router();
const dispositivosController = new DispositivosController();

router.get('/', authJWT, (req, res, next) => dispositivosController.list(req, res, next));
router.get('/:id', authJWT, (req, res, next) => dispositivosController.findById(req, res, next));
router.post('/', authJWT, (req, res, next) => dispositivosController.create(req, res, next));
router.put('/:id', authJWT, (req, res, next) => dispositivosController.update(req, res, next));
router.patch('/:id/sensores', authJWT, (req, res, next) => dispositivosController.updateSensores(req, res, next));
router.patch('/:id/vinculo', authJWT, (req, res, next) => dispositivosController.updateVinculo(req, res, next));
router.post('/:id/testar', authJWT, (req, res, next) => dispositivosController.testar(req, res, next));

export { router as dispositivosRouter };