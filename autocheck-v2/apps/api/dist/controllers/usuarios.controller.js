"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usuariosController = exports.UsuariosController = void 0;
const usuarios_service_1 = require("../services/usuarios.service");
const usuarios_schemas_1 = require("../validators/usuarios.schemas");
class UsuariosController {
    async list(req, res) {
        const filters = usuarios_schemas_1.usuarioFilterSchema.parse(req.query);
        const result = await usuarios_service_1.usuariosService.list(filters);
        res.json(result);
    }
    async getById(req, res) {
        const { id } = req.params;
        const usuario = await usuarios_service_1.usuariosService.getById(id);
        res.json(usuario);
    }
    async create(req, res) {
        const input = usuarios_schemas_1.usuarioCreateSchema.parse(req.body);
        const usuario = await usuarios_service_1.usuariosService.create(input);
        res.status(201).json(usuario);
    }
    async update(req, res) {
        const { id } = req.params;
        const input = usuarios_schemas_1.usuarioUpdateSchema.parse(req.body);
        const usuario = await usuarios_service_1.usuariosService.update(id, input, req.user.userId, req.user.perfil);
        res.json(usuario);
    }
    async delete(req, res) {
        const { id } = req.params;
        const result = await usuarios_service_1.usuariosService.delete(id);
        res.json(result);
    }
    async trocarSenha(req, res) {
        const { id } = req.params;
        const input = usuarios_schemas_1.usuarioTrocarSenhaSchema.parse(req.body);
        // Só pode trocar a própria senha
        if (id !== req.user.userId) {
            return res.status(403).json({ error: 'Você só pode trocar sua própria senha' });
        }
        const result = await usuarios_service_1.usuariosService.trocarSenha(id, input);
        res.json(result);
    }
    async getMeuPerfil(req, res) {
        const usuario = await usuarios_service_1.usuariosService.getMeuPerfil(req.user.userId);
        res.json(usuario);
    }
}
exports.UsuariosController = UsuariosController;
exports.usuariosController = new UsuariosController();
//# sourceMappingURL=usuarios.controller.js.map