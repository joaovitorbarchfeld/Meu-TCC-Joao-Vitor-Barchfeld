"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const auth_schemas_1 = require("../validators/auth.schemas");
class AuthController {
    async login(req, res) {
        const input = auth_schemas_1.loginSchema.parse(req.body);
        const result = await auth_service_1.authService.login(input);
        res.json(result);
    }
    async refresh(req, res) {
        const input = auth_schemas_1.refreshTokenSchema.parse(req.body);
        const result = await auth_service_1.authService.refreshToken(input.refresh_token);
        res.json(result);
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map