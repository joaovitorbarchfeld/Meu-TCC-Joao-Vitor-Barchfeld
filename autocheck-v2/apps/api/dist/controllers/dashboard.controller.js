"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardController = exports.DashboardController = void 0;
const db_1 = require("../config/db");
class DashboardController {
    async getVeiculos(req, res) {
        const veiculos = await db_1.db
            .selectFrom('veiculos')
            .select(['id', 'nome', 'placa', 'cor_hex', 'ativo'])
            .orderBy('nome', 'asc')
            .execute();
        const veiculosComStatus = await Promise.all(veiculos.map(async (veiculo) => {
            let status = 'disponivel';
            let usuario_nome = undefined;
            if (!veiculo.ativo) {
                status = 'inativo';
            }
            else {
                const reservaAtiva = await db_1.db
                    .selectFrom('reservas')
                    .innerJoin('usuarios', 'reservas.usuario_id', 'usuarios.id')
                    .select(['reservas.id', 'usuarios.nome as usuario_nome'])
                    .where('reservas.veiculo_id', '=', veiculo.id)
                    .where('reservas.start_at', '<=', new Date())
                    .where('reservas.end_at', '>', new Date())
                    .executeTakeFirst();
                if (reservaAtiva) {
                    status = 'em_uso';
                    usuario_nome = reservaAtiva.usuario_nome;
                }
                else {
                    const dispositivo = await db_1.db
                        .selectFrom('dispositivos')
                        .select('id')
                        .where('veiculo_id', '=', veiculo.id)
                        .where('ativo', '=', true)
                        .executeTakeFirst();
                    if (!dispositivo) {
                        status = 'sem_dispositivo';
                    }
                }
            }
            return { ...veiculo, status, usuario_nome };
        }));
        res.json(veiculosComStatus);
    }
}
exports.DashboardController = DashboardController;
exports.dashboardController = new DashboardController();
//# sourceMappingURL=dashboard.controller.js.map