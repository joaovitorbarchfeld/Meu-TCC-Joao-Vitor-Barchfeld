"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authJWT_1 = require("../middlewares/authJWT");
const reservas_controller_1 = require("../controllers/reservas.controller");
const router = (0, express_1.Router)();
// Todas as rotas precisam de autenticação
router.use(authJWT_1.authJWT);
// GET /v1/reservas - Listar todas (todos podem ver)
router.get('/', (req, res, next) => {
    reservas_controller_1.reservasController.list(req, res).catch(next);
});
// GET /v1/reservas/minhas - Minhas reservas
router.get('/minhas', (req, res, next) => {
    reservas_controller_1.reservasController.getMinhas(req, res).catch(next);
});
// GET /v1/reservas/calendario - Calendário de reservas
router.get('/calendario', (req, res, next) => {
    reservas_controller_1.reservasController.getCalendario(req, res).catch(next);
});
// GET /v1/reservas/:id - Buscar por ID
router.get('/:id', (req, res, next) => {
    reservas_controller_1.reservasController.getById(req, res).catch(next);
});
// POST /v1/reservas - Criar reserva (todos podem criar)
router.post('/', (req, res, next) => {
    reservas_controller_1.reservasController.create(req, res).catch(next);
});
// PUT /v1/reservas/:id - Editar (dono ou gestor/admin)
router.put('/:id', (req, res, next) => {
    reservas_controller_1.reservasController.update(req, res).catch(next);
});
// DELETE /v1/reservas/:id - Cancelar (dono ou gestor/admin)
router.delete('/:id', (req, res, next) => {
    reservas_controller_1.reservasController.delete(req, res).catch(next);
});
exports.default = router;
//# sourceMappingURL=reservas.routes.js.map