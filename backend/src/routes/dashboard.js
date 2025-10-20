import express from 'express';
import {
  getDashboardStats,
  getTotemsByRegion,
  getNotificacionesRecientes,
  getTotemsByInstitucion,
  getTotemsByCategoria,
  getActivityStats,
  getSystemHealth
} from '../controllers/dashboardController.js';
import { authenticateToken, requireModerator } from '../middlewares/auth.js';
import { validateQuery } from '../middlewares/validation.js';
import Joi from 'joi';

const router = express.Router();

// Schemas de validación
const dashboardQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(10),
  days: Joi.number().integer().min(1).max(365).default(30)
});

// Rutas protegidas
router.get('/stats', authenticateToken, requireModerator, getDashboardStats);
router.get('/totems-by-region', authenticateToken, requireModerator, getTotemsByRegion);
router.get('/notificaciones-recientes', authenticateToken, requireModerator, validateQuery(dashboardQuerySchema), getNotificacionesRecientes);
router.get('/totems-by-institucion', authenticateToken, requireModerator, getTotemsByInstitucion);
router.get('/totems-by-categoria', authenticateToken, requireModerator, getTotemsByCategoria);
router.get('/activity-stats', authenticateToken, requireModerator, validateQuery(dashboardQuerySchema), getActivityStats);
router.get('/system-health', authenticateToken, requireModerator, getSystemHealth);

export default router;

