"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authJWT_1 = require("../middlewares/authJWT");
const dispositivos_controller_1 = require("../controllers/dispositivos.controller");
const router = (0, express_1.Router)();
// POST /v1/dispositivos/validar - Validação ESP32 (SEM autenticação JWT!)
router.post('/validar', (req, res, next) => {
    dispositivos_controller_1.dispositivosController.validar(req, res).catch(next);
});
// Todas as outras rotas precisam de autenticação
router.use(authJWT_1.authJWT);
// GET /v1/dispositivos - Listar (gestor e admin)
router.get('/', (0, authJWT_1.authorize)('gestor', 'admin'), (req, res, next) => {
    dispositivos_controller_1.dispositivosController.list(req, res).catch(next);
});
// GET /v1/dispositivos/:id - Buscar por ID (gestor e admin)
router.get('/:id', (0, authJWT_1.authorize)('gestor', 'admin'), (req, res, next) => {
    dispositivos_controller_1.dispositivosController.getById(req, res).catch(next);
});
// POST /v1/dispositivos - Criar (apenas admin)
router.post('/', (0, authJWT_1.authorize)('admin'), (req, res, next) => {
    dispositivos_controller_1.dispositivosController.create(req, res).catch(next);
});
// PUT /v1/dispositivos/:id - Editar (apenas admin)
router.put('/:id', (0, authJWT_1.authorize)('admin'), (req, res, next) => {
    dispositivos_controller_1.dispositivosController.update(req, res).catch(next);
});
// DELETE /v1/dispositivos/:id - Excluir (apenas admin)
router.delete('/:id', (0, authJWT_1.authorize)('admin'), (req, res, next) => {
    dispositivos_controller_1.dispositivosController.delete(req, res).catch(next);
});
// PATCH /v1/dispositivos/:id/vincular - Vincular a veículo (apenas admin)
router.patch('/:id/vincular', (0, authJWT_1.authorize)('admin'), (req, res, next) => {
    dispositivos_controller_1.dispositivosController.vincular(req, res).catch(next);
});
// PATCH /v1/dispositivos/:id/desvincular - Desvincular de veículo (apenas admin)
router.patch('/:id/desvincular', (0, authJWT_1.authorize)('admin'), (req, res, next) => {
    dispositivos_controller_1.dispositivosController.desvincular(req, res).catch(next);
});
exports.default = router;
//# sourceMappingURL=dispositivos.routes.js.map