"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authJWT_1 = require("../middlewares/authJWT");
const veiculos_controller_1 = require("../controllers/veiculos.controller");
const router = (0, express_1.Router)();
router.use(authJWT_1.authJWT);
router.get('/', (req, res, next) => {
    veiculos_controller_1.veiculosController.list(req, res).catch(next);
});
router.get('/:id', (req, res, next) => {
    veiculos_controller_1.veiculosController.getById(req, res).catch(next);
});
router.post('/', (0, authJWT_1.authorize)('gestor', 'admin'), (req, res, next) => {
    veiculos_controller_1.veiculosController.create(req, res).catch(next);
});
router.put('/:id', (0, authJWT_1.authorize)('gestor', 'admin'), (req, res, next) => {
    veiculos_controller_1.veiculosController.update(req, res).catch(next);
});
router.delete('/:id', (0, authJWT_1.authorize)('admin'), (req, res, next) => {
    veiculos_controller_1.veiculosController.delete(req, res).catch(next);
});
// Rota original
router.patch('/:id/toggle', (0, authJWT_1.authorize)('gestor', 'admin'), (req, res, next) => {
    veiculos_controller_1.veiculosController.toggleAtivo(req, res).catch(next);
});
// Rota alternativa para compatibilidade com frontend
router.patch('/:id/toggle-status', (0, authJWT_1.authorize)('gestor', 'admin'), (req, res, next) => {
    veiculos_controller_1.veiculosController.toggleAtivo(req, res).catch(next);
});
exports.default = router;
//# sourceMappingURL=veiculos.routes.js.map