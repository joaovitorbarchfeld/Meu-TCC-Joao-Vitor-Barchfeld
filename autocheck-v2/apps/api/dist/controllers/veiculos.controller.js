"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.veiculosController = exports.VeiculosController = void 0;
const veiculos_service_1 = require("../services/veiculos.service");
const veiculos_schemas_1 = require("../validators/veiculos.schemas");
class VeiculosController {
    async list(req, res) {
        const filters = veiculos_schemas_1.veiculoFilterSchema.parse(req.query);
        const result = await veiculos_service_1.veiculosService.list(filters);
        res.json(result);
    }
    async getById(req, res) {
        const { id } = req.params;
        const veiculo = await veiculos_service_1.veiculosService.getById(id);
        res.json(veiculo);
    }
    async create(req, res) {
        const input = veiculos_schemas_1.veiculoCreateSchema.parse(req.body);
        const veiculo = await veiculos_service_1.veiculosService.create(input);
        res.status(201).json(veiculo);
    }
    async update(req, res) {
        const { id } = req.params;
        const input = veiculos_schemas_1.veiculoUpdateSchema.parse(req.body);
        const veiculo = await veiculos_service_1.veiculosService.update(id, input);
        res.json(veiculo);
    }
    async delete(req, res) {
        const { id } = req.params;
        const result = await veiculos_service_1.veiculosService.delete(id);
        res.json(result);
    }
    async toggleAtivo(req, res) {
        const { id } = req.params;
        const veiculo = await veiculos_service_1.veiculosService.toggleAtivo(id);
        res.json(veiculo);
    }
}
exports.VeiculosController = VeiculosController;
exports.veiculosController = new VeiculosController();
//# sourceMappingURL=veiculos.controller.js.map