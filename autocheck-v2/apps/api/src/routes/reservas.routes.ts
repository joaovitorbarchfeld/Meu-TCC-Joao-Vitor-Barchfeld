import { Router } from 'express';
import { authJWT } from '../middlewares/authJWT';
import { reservasController } from '../controllers/reservas.controller';

const router = Router();

// Todas as rotas precisam de autenticação
router.use(authJWT);

// GET /v1/reservas - Listar todas (todos podem ver)
router.get('/', (req, res, next) => {
  reservasController.list(req, res).catch(next);
});

// GET /v1/reservas/minhas - Minhas reservas
router.get('/minhas', (req, res, next) => {
  reservasController.getMinhas(req, res).catch(next);
});

// GET /v1/reservas/calendario - Calendário de reservas
router.get('/calendario', (req, res, next) => {
  reservasController.getCalendario(req, res).catch(next);
});

// GET /v1/reservas/:id - Buscar por ID
router.get('/:id', (req, res, next) => {
  reservasController.getById(req, res).catch(next);
});

// POST /v1/reservas - Criar reserva (todos podem criar)
router.post('/', (req, res, next) => {
  reservasController.create(req, res).catch(next);
});

// PUT /v1/reservas/:id - Editar (dono ou gestor/admin)
router.put('/:id', (req, res, next) => {
  reservasController.update(req, res).catch(next);
});

// DELETE /v1/reservas/:id - Cancelar (dono ou gestor/admin)
router.delete('/:id', (req, res, next) => {
  reservasController.delete(req, res).catch(next);
});

export default router;