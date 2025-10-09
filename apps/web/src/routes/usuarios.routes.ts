import { Router } from 'express';
import { authJWT } from '../middlewares/authJWT';
import { UsuariosController } from '../controllers/usuarios.controller';

const router = Router();
const usuariosController = new UsuariosController();

router.get('/', authJWT, (req, res, next) => usuariosController.list(req, res, next));
router.get('/:id', authJWT, (req, res, next) => usuariosController.findById(req, res, next));
router.post('/', authJWT, (req, res, next) => usuariosController.create(req, res, next));
router.put('/:id', authJWT, (req, res, next) => usuariosController.update(req, res, next));
router.patch('/:id/ativo', authJWT, (req, res, next) => usuariosController.toggleActive(req, res, next));
router.delete('/:id', authJWT, (req, res, next) => usuariosController.delete(req, res, next));

export { router as usuariosRouter };