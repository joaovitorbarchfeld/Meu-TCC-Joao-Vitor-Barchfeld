import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { testConnection } from './config/db';
import { logger } from './utils/logger';
import { errorHandler } from './middlewares/errorHandler';
import routes from './routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.WEB_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: 'Muitas requisições',
});
app.use(limiter);

const authLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  message: 'Muitas tentativas de login',
});
app.use('/v1/auth/login', authLimiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/v1', routes);
app.use(errorHandler);

async function startServer() {
  try {
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Falha ao conectar no banco');
    }

    app.listen(env.PORT, () => {
      console.log('');
      console.log('╔════════════════════════════════════════╗');
      console.log('║                                        ║');
      console.log('║     🚗 AutoCheck v2 - API Rodando!   ║');
      console.log('║                                        ║');
      console.log(`║     http://localhost:${env.PORT}              ║`);
      console.log('║                                        ║');
      console.log('║  📚 TCC: João Vítor Barchfeld         ║');
      console.log('║      SETREM 2025                       ║');
      console.log('║                                        ║');
      console.log('╚════════════════════════════════════════╝');
      console.log('');
      console.log('📋 Endpoints:');
      console.log(`   GET  http://localhost:${env.PORT}/health`);
      console.log(`   POST http://localhost:${env.PORT}/v1/auth/login`);
      console.log(`   GET  http://localhost:${env.PORT}/v1/dashboard/veiculos`);
      console.log('');
      console.log('🔐 Login: admin@autocheck.com / autocheck123');
      console.log('');
    });
  } catch (error) {
    logger.error({ error }, 'Erro ao iniciar servidor');
    process.exit(1);
  }
}

startServer();
