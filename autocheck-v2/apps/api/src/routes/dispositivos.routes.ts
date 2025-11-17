import { Router } from 'express';
import { authJWT, authorize } from '../middlewares/authJWT';
import { dispositivosController } from '../controllers/dispositivos.controller';

const router = Router();

// POST /v1/dispositivos/validar - Validação ESP32 (SEM autenticação JWT!)
router.post('/validar', (req, res, next) => {
  dispositivosController.validar(req, res).catch(next);
});

// Todas as outras rotas precisam de autenticação
router.use(authJWT);

// GET /v1/dispositivos - Listar (gestor e admin)
router.get('/', authorize('gestor', 'admin'), (req, res, next) => {
  dispositivosController.list(req, res).catch(next);
});

// GET /v1/dispositivos/:id - Buscar por ID (gestor e admin)
router.get('/:id', authorize('gestor', 'admin'), (req, res, next) => {
  dispositivosController.getById(req, res).catch(next);
});

// POST /v1/dispositivos - Criar (apenas admin)
router.post('/', authorize('admin'), (req, res, next) => {
  dispositivosController.create(req, res).catch(next);
});

// PUT /v1/dispositivos/:id - Editar (apenas admin)
router.put('/:id', authorize('admin'), (req, res, next) => {
  dispositivosController.update(req, res).catch(next);
});

// DELETE /v1/dispositivos/:id - Excluir (apenas admin)
router.delete('/:id', authorize('admin'), (req, res, next) => {
  dispositivosController.delete(req, res).catch(next);
});

// PATCH /v1/dispositivos/:id/vincular - Vincular a veículo (apenas admin)
router.patch('/:id/vincular', authorize('admin'), (req, res, next) => {
  dispositivosController.vincular(req, res).catch(next);
});

// PATCH /v1/dispositivos/:id/desvincular - Desvincular de veículo (apenas admin)
router.patch('/:id/desvincular', authorize('admin'), (req, res, next) => {
  dispositivosController.desvincular(req, res).catch(next);
});

export default router;