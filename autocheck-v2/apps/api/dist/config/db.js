"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.pool = void 0;
exports.testConnection = testConnection;
exports.closeDatabase = closeDatabase;
const pg_1 = require("pg");
const kysely_1 = require("kysely");
const env_1 = require("./env");
exports.pool = new pg_1.Pool({
    connectionString: env_1.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
exports.db = new kysely_1.Kysely({
    dialect: new kysely_1.PostgresDialect({ pool: exports.pool }),
});
async function testConnection() {
    try {
        await exports.pool.query('SELECT 1');
        return true;
    }
    catch (error) {
        console.error('Erro ao conectar no banco:', error);
        return false;
    }
}
async function closeDatabase() {
    await exports.db.destroy();
    await exports.pool.end();
}
//# sourceMappingURL=db.js.map