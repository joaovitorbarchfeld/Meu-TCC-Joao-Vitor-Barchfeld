"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reservasController = exports.ReservasController = void 0;
const reservas_service_1 = require("../services/reservas.service");
const reservas_schemas_1 = require("../validators/reservas.schemas");
class ReservasController {
    async list(req, res) {
        const filters = reservas_schemas_1.reservaFilterSchema.parse(req.query);
        const result = await reservas_service_1.reservasService.list(filters, req.user?.userId);
        res.json(result);
    }
    async getById(req, res) {
        const { id } = req.params;
        const reserva = await reservas_service_1.reservasService.getById(id);
        res.json(reserva);
    }
    async create(req, res) {
        const input = reservas_schemas_1.reservaCreateSchema.parse(req.body);
        const reserva = await reservas_service_1.reservasService.create(input, req.user.userId);
        res.status(201).json(reserva);
    }
    async update(req, res) {
        const { id } = req.params;
        const input = reservas_schemas_1.reservaUpdateSchema.parse(req.body);
        const reserva = await reservas_service_1.reservasService.update(id, input, req.user.userId, req.user.perfil);
        res.json(reserva);
    }
    async delete(req, res) {
        const { id } = req.params;
        const result = await reservas_service_1.reservasService.delete(id, req.user.userId, req.user.perfil);
        res.json(result);
    }
    async getMinhas(req, res) {
        const { status } = req.query;
        const result = await reservas_service_1.reservasService.getMinhasReservas(req.user.userId, status || 'todas');
        res.json(result);
    }
    async getCalendario(req, res) {
        const filters = reservas_schemas_1.reservaCalendarioSchema.parse(req.query);
        const reservas = await reservas_service_1.reservasService.getCalendario(filters);
        res.json(reservas);
    }
}
exports.ReservasController = ReservasController;
exports.reservasController = new ReservasController();
//# sourceMappingURL=reservas.controller.js.map