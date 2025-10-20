import express from 'express';
import authRoutes from './auth.js';
import regionRoutes from './regiones.js';
import usuarioRoutes from './usuarios.js';
import institucionRoutes from './instituciones.js';
import categoriaRoutes from './categorias.js';
import plantillaRoutes from './plantillas.js';
import totemRoutes from './totems.js';
import multimediaRoutes from './multimedia.js';
import notificacionRoutes from './notificaciones.js';
import userChatRoutes from './userchat.js';
import configuracionRoutes from './configuracion.js';
import dashboardRoutes from './dashboard.js';

const router = express.Router();

// Rutas principales
router.use('/auth', authRoutes);
router.use('/regiones', regionRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/instituciones', institucionRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/plantillas', plantillaRoutes);
router.use('/totems', totemRoutes);
router.use('/multimedia', multimediaRoutes);
router.use('/notificaciones', notificacionRoutes);
router.use('/userchat', userChatRoutes);
router.use('/configuracion', configuracionRoutes);
router.use('/dashboard', dashboardRoutes);

// Ruta de información de la API
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'TOTEM Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      regiones: '/api/regiones',
      usuarios: '/api/usuarios',
      instituciones: '/api/instituciones',
      categorias: '/api/categorias',
      plantillas: '/api/plantillas',
      totems: '/api/totems',
      multimedia: '/api/multimedia',
      notificaciones: '/api/notificaciones',
      userchat: '/api/userchat',
      configuracion: '/api/configuracion',
      dashboard: '/api/dashboard'
    },
    documentation: '/api/docs'
  });
});

export { router };


