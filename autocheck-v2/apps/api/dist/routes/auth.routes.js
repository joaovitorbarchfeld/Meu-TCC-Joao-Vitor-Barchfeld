"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
router.post('/login', (req, res, next) => {
    auth_controller_1.authController.login(req, res).catch(next);
});
router.post('/refresh', (req, res, next) => {
    auth_controller_1.authController.refresh(req, res).catch(next);
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map