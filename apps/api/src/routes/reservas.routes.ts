import { Router } from 'express';
import { authJWT } from '@/middlewares/authJWT';
import { ReservasController } from '@/controllers/reservas.controller';

const router = Router();
const reservasController = new ReservasController();

router.get('/', authJWT, (req, res, next) => reservasController.list(req, res, next));
router.get('/:id', authJWT, (req, res, next) => reservasController.findById(req, res, next));
router.post('/', authJWT, (req, res, next) => reservasController.create(req, res, next));
router.put('/:id', authJWT, (req, res, next) => reservasController.update(req, res, next));
router.delete('/:id', authJWT, (req, res, next) => reservasController.delete(req, res, next));

export { router as reservasRouter };