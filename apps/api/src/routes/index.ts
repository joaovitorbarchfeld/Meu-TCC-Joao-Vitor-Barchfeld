import { Router } from 'express';
import authRoutes from './auth.routes';
import dashboardRoutes from './dashboard.routes';
import veiculosRoutes from './veiculos.routes';
import reservasRoutes from './reservas.routes';
import usuariosRoutes from './usuarios.routes';
import dispositivosRoutes from './dispositivos.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/veiculos', veiculosRoutes);
router.use('/reservas', reservasRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/dispositivos', dispositivosRoutes);

export default router;