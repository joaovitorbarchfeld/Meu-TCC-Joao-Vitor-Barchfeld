"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authJWT_1 = require("../middlewares/authJWT");
const usuarios_controller_1 = require("../controllers/usuarios.controller");
const router = (0, express_1.Router)();
router.use(authJWT_1.authJWT);
router.get('/', (0, authJWT_1.authorize)('gestor', 'admin'), (req, res, next) => {
    usuarios_controller_1.usuariosController.list(req, res).catch(next);
});
router.get('/me', (req, res, next) => {
    usuarios_controller_1.usuariosController.me(req, res).catch(next);
});
router.get('/:id', (0, authJWT_1.authorize)('gestor', 'admin'), (req, res, next) => {
    usuarios_controller_1.usuariosController.getById(req, res).catch(next);
});
router.post('/', (0, authJWT_1.authorize)('admin'), (req, res, next) => {
    usuarios_controller_1.usuariosController.create(req, res).catch(next);
});
router.put('/:id', (0, authJWT_1.authorize)('admin'), (req, res, next) => {
    usuarios_controller_1.usuariosController.update(req, res).catch(next);
});
router.delete('/:id', (0, authJWT_1.authorize)('admin'), (req, res, next) => {
    usuarios_controller_1.usuariosController.delete(req, res).catch(next);
});
router.patch('/:id/toggle', (0, authJWT_1.authorize)('admin'), (req, res, next) => {
    usuarios_controller_1.usuariosController.toggleAtivo(req, res).catch(next);
});
router.patch('/:id/toggle-status', (0, authJWT_1.authorize)('admin'), (req, res, next) => {
    usuarios_controller_1.usuariosController.toggleAtivo(req, res).catch(next);
});
exports.default = router;
//# sourceMappingURL=usuarios.routes.js.map