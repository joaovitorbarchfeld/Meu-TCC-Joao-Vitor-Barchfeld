import { Router } from 'express';
import { authJWT, authorize } from '../middlewares/authJWT';
import { usuariosController } from '../controllers/usuarios.controller';

const router = Router();

router.use(authJWT);

router.get('/', authorize('gestor', 'admin'), (req, res, next) => {
  usuariosController.list(req, res).catch(next);
});

router.get('/me', (req, res, next) => {
  usuariosController.me(req, res).catch(next);
});

router.get('/:id', authorize('gestor', 'admin'), (req, res, next) => {
  usuariosController.getById(req, res).catch(next);
});

router.post('/', authorize('admin'), (req, res, next) => {
  usuariosController.create(req, res).catch(next);
});

router.put('/:id', authorize('admin'), (req, res, next) => {
  usuariosController.update(req, res).catch(next);
});

router.delete('/:id', authorize('admin'), (req, res, next) => {
  usuariosController.delete(req, res).catch(next);
});

router.patch('/:id/toggle', authorize('admin'), (req, res, next) => {
  usuariosController.toggleAtivo(req, res).catch(next);
});

router.patch('/:id/toggle-status', authorize('admin'), (req, res, next) => {
  usuariosController.toggleAtivo(req, res).catch(next);
});

export default router;