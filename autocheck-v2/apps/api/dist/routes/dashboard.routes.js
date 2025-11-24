"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authJWT_1 = require("../middlewares/authJWT");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const router = (0, express_1.Router)();
router.get('/veiculos', authJWT_1.authJWT, (req, res, next) => {
    dashboard_controller_1.dashboardController.getVeiculos(req, res).catch(next);
});
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map