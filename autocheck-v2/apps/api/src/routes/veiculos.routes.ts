import { Router } from 'express';
import { authJWT, authorize } from '../middlewares/authJWT';
import { veiculosController } from '../controllers/veiculos.controller';

const router = Router();

router.use(authJWT);

router.get('/', (req, res, next) => {
  veiculosController.list(req, res).catch(next);
});

router.get('/:id', (req, res, next) => {
  veiculosController.getById(req, res).catch(next);
});

router.post('/', authorize('gestor', 'admin'), (req, res, next) => {
  veiculosController.create(req, res).catch(next);
});

router.put('/:id', authorize('gestor', 'admin'), (req, res, next) => {
  veiculosController.update(req, res).catch(next);
});

router.delete('/:id', authorize('admin'), (req, res, next) => {
  veiculosController.delete(req, res).catch(next);
});

// Rota original
router.patch('/:id/toggle', authorize('gestor', 'admin'), (req, res, next) => {
  veiculosController.toggleAtivo(req, res).catch(next);
});

// Rota alternativa para compatibilidade com frontend
router.patch('/:id/toggle-status', authorize('gestor', 'admin'), (req, res, next) => {
  veiculosController.toggleAtivo(req, res).catch(next);
});

export default router;