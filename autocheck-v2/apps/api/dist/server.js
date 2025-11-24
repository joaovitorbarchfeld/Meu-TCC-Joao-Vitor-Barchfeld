"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const logger_1 = require("./utils/logger");
const errorHandler_1 = require("./middlewares/errorHandler");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: env_1.env.WEB_ORIGIN }));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: env_1.env.RATE_LIMIT_WINDOW_MS,
    max: env_1.env.RATE_LIMIT_MAX_REQUESTS,
    message: 'Muitas requisições',
});
app.use(limiter);
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: env_1.env.RATE_LIMIT_WINDOW_MS,
    max: env_1.env.AUTH_RATE_LIMIT_MAX,
    message: 'Muitas tentativas de login',
});
app.use('/v1/auth/login', authLimiter);
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/v1', routes_1.default);
app.use(errorHandler_1.errorHandler);
async function startServer() {
    try {
        const dbConnected = await (0, db_1.testConnection)();
        if (!dbConnected) {
            throw new Error('Falha ao conectar no banco');
        }
        app.listen(env_1.env.PORT, () => {
            console.log('');
            console.log('╔════════════════════════════════════════╗');
            console.log('║                                        ║');
            console.log('║     🚗 AutoCheck v2 - API Rodando!   ║');
            console.log('║                                        ║');
            console.log(`║     http://localhost:${env_1.env.PORT}              ║`);
            console.log('║                                        ║');
            console.log('║  📚 TCC: João Vítor Barchfeld         ║');
            console.log('║      SETREM 2025                       ║');
            console.log('║                                        ║');
            console.log('╚════════════════════════════════════════╝');
            console.log('');
            console.log('📋 Endpoints:');
            console.log(`   GET  http://localhost:${env_1.env.PORT}/health`);
            console.log(`   POST http://localhost:${env_1.env.PORT}/v1/auth/login`);
            console.log(`   GET  http://localhost:${env_1.env.PORT}/v1/dashboard/veiculos`);
            console.log('');
            console.log('🔐 Login: admin@autocheck.com / autocheck123');
            console.log('');
        });
    }
    catch (error) {
        logger_1.logger.error({ error }, 'Erro ao iniciar servidor');
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=server.js.map