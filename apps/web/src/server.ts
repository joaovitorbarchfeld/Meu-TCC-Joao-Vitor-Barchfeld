import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { logger } from '@/utils/logger';
import { errorHandler, notFoundHandler } from '@/middlewares/errorHandler';

// Importar rotas
import { authRouter } from '@/routes/auth.routes';
import { dashboardRouter } from '@/routes/dashboard.routes';
import { veiculosRouter } from '@/routes/veiculos.routes';
import { reservasRouter } from '@/routes/reservas.routes';
import { usuariosRouter } from '@/routes/usuarios.routes';
import { dispositivosRouter } from '@/routes/dispositivos.routes';
import { relatoriosRouter } from '@/routes/relatorios.routes';

// Criar app Express
const app = express();
const PORT = process.env.PORT || 3000;

// Security
app.use(helmet());
app.use(cors({ origin: process.env.WEB_ORIGIN || '*' }));

// Body parser
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: Date.now() - start,
    });
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    ok: true, 
    message: 'AutoCheck API running',
    uptime: process.uptime()
  });
});

// Rotas
app.use('/auth', authRouter);
app.use('/dashboard', dashboardRouter);
app.use('/veiculos', veiculosRouter);
app.use('/reservas', reservasRouter);
app.use('/usuarios', usuariosRouter);
app.use('/dispositivos', dispositivosRouter);
app.use('/relatorios', relatoriosRouter);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Iniciar servidor
const server = app.listen(PORT, () => {
  logger.info(`AutoCheck API started on port ${PORT}`);
  logger.info(`Health: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => process.exit(0));
});

export default app;