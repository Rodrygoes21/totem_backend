import { Router } from 'express';
import usuariosRouter from './usuarios.js';
import institucionesRouter from './instituciones.js';
import categoriasRouter from './categorias.js';
import totemsRouter from './totems.js';
import multimediaRouter from './multimedia.js';
import userChatRouter from './userchat.js';
import dashboardRouter from './dashboard.js';

export const router = Router();

router.use('/usuarios', usuariosRouter);
router.use('/instituciones', institucionesRouter);
router.use('/categorias', categoriasRouter);
router.use('/totems', totemsRouter);
router.use('/multimedia', multimediaRouter);
router.use('/userchat', userChatRouter);
router.use('/dashboard', dashboardRouter);


