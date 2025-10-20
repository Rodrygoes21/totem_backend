import express from 'express';
import {
  getAllNotificaciones,
  getNotificacionById,
  createNotificacion,
  updateNotificacion,
  deleteNotificacion,
  toggleNotificacionStatus,
  getNotificacionesActivas,
  markNotificacionAsRead
} from '../controllers/notificacionController.js';
import { authenticateToken, requireAdmin, requireModerator } from '../middlewares/auth.js';
import { validateRequest, validateParams, validateQuery, paginationSchema, idSchema } from '../middlewares/validation.js';
import Joi from 'joi';

const router = express.Router();

// Schemas de validación
const notificacionSchema = Joi.object({
  titulo: Joi.string().min(3).max(200).required(),
  mensaje: Joi.string().min(10).required(),
  tipo: Joi.string().valid('info', 'warning', 'error', 'success').default('info'),
  prioridad: Joi.string().valid('baja', 'media', 'alta', 'urgente').default('media'),
  totem_id: Joi.number().integer().positive().optional(),
  fecha_inicio: Joi.date().required(),
  fecha_fin: Joi.date().optional(),
  activo: Joi.boolean().default(true)
});

const updateNotificacionSchema = Joi.object({
  titulo: Joi.string().min(3).max(200).optional(),
  mensaje: Joi.string().min(10).optional(),
  tipo: Joi.string().valid('info', 'warning', 'error', 'success').optional(),
  prioridad: Joi.string().valid('baja', 'media', 'alta', 'urgente').optional(),
  totem_id: Joi.number().integer().positive().optional(),
  fecha_inicio: Joi.date().optional(),
  fecha_fin: Joi.date().optional(),
  activo: Joi.boolean().optional()
});

// Rutas públicas
router.get('/', validateQuery(paginationSchema), getAllNotificaciones);
router.get('/activas', getNotificacionesActivas);
router.get('/:id', validateParams(idSchema), getNotificacionById);

// Rutas protegidas
router.post('/', authenticateToken, requireModerator, validateRequest(notificacionSchema), createNotificacion);
router.put('/:id', authenticateToken, requireModerator, validateParams(idSchema), validateRequest(updateNotificacionSchema), updateNotificacion);
router.delete('/:id', authenticateToken, requireAdmin, validateParams(idSchema), deleteNotificacion);
router.put('/:id/toggle', authenticateToken, requireModerator, validateParams(idSchema), toggleNotificacionStatus);
router.put('/:id/read', authenticateToken, validateParams(idSchema), markNotificacionAsRead);

export default router;
