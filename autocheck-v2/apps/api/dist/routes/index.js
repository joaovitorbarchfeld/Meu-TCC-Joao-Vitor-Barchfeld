"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const dashboard_routes_1 = __importDefault(require("./dashboard.routes"));
const veiculos_routes_1 = __importDefault(require("./veiculos.routes"));
const reservas_routes_1 = __importDefault(require("./reservas.routes"));
const usuarios_routes_1 = __importDefault(require("./usuarios.routes"));
const dispositivos_routes_1 = __importDefault(require("./dispositivos.routes"));
const router = (0, express_1.Router)();
router.use('/auth', auth_routes_1.default);
router.use('/dashboard', dashboard_routes_1.default);
router.use('/veiculos', veiculos_routes_1.default);
router.use('/reservas', reservas_routes_1.default);
router.use('/usuarios', usuarios_routes_1.default);
router.use('/dispositivos', dispositivos_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map