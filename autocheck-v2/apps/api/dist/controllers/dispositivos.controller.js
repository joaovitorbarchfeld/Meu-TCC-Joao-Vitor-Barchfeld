"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dispositivosController = exports.DispositivosController = void 0;
const dispositivos_service_1 = require("../services/dispositivos.service");
const dispositivos_schemas_1 = require("../validators/dispositivos.schemas");
class DispositivosController {
    async list(req, res) {
        const filters = dispositivos_schemas_1.dispositivoFilterSchema.parse(req.query);
        const result = await dispositivos_service_1.dispositivosService.list(filters);
        res.json(result);
    }
    async getById(req, res) {
        const { id } = req.params;
        const dispositivo = await dispositivos_service_1.dispositivosService.getById(id);
        res.json(dispositivo);
    }
    async create(req, res) {
        const input = dispositivos_schemas_1.dispositivoCreateSchema.parse(req.body);
        const dispositivo = await dispositivos_service_1.dispositivosService.create(input);
        res.status(201).json(dispositivo);
    }
    async update(req, res) {
        const { id } = req.params;
        const input = dispositivos_schemas_1.dispositivoUpdateSchema.parse(req.body);
        const dispositivo = await dispositivos_service_1.dispositivosService.update(id, input);
        res.json(dispositivo);
    }
    async delete(req, res) {
        const { id } = req.params;
        const result = await dispositivos_service_1.dispositivosService.delete(id);
        res.json(result);
    }
    async vincular(req, res) {
        const { id } = req.params;
        const input = dispositivos_schemas_1.dispositivoVincularSchema.parse(req.body);
        const dispositivo = await dispositivos_service_1.dispositivosService.vincular(id, input);
        res.json(dispositivo);
    }
    async desvincular(req, res) {
        const { id } = req.params;
        const dispositivo = await dispositivos_service_1.dispositivosService.desvincular(id);
        res.json(dispositivo);
    }
    async validar(req, res) {
        const input = dispositivos_schemas_1.dispositivoValidarSchema.parse(req.body);
        const result = await dispositivos_service_1.dispositivosService.validar(input);
        res.json(result);
    }
}
exports.DispositivosController = DispositivosController;
exports.dispositivosController = new DispositivosController();
//# sourceMappingURL=dispositivos.controller.js.map