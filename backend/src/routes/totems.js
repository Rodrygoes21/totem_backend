import express from 'express';
import {
  getAllTotems,
  getTotemById,
  createTotem,
  updateTotem,
  deleteTotem,
  toggleTotemStatus,
  getTotemMultimedia,
  getTotemNotificaciones,
  getTotemChats
} from '../controllers/totemController.js';
import { authenticateToken, requireAdmin, requireModerator } from '../middlewares/auth.js';
import { validateRequest, validateParams, validateQuery, paginationSchema, idSchema } from '../middlewares/validation.js';
import Joi from 'joi';

const router = express.Router();

// Schemas de validación
const totemSchema = Joi.object({
  nombre_to: Joi.string().min(3).max(100).required(),
  ubicacion: Joi.string().min(5).max(200).required(),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).required(),
  descripcion: Joi.string().max(1000).optional(),
  activo: Joi.boolean().default(true),
  institucion_id: Joi.number().integer().positive().optional(),
  categoria_id: Joi.number().integer().positive().optional(),
  region_id: Joi.number().integer().positive().optional(),
  plantilla_id: Joi.number().integer().positive().optional(),
  login_sitio: Joi.string().alphanum().min(3).max(100).optional(),
  password_sitio: Joi.string().min(6).optional(),
  chatpdf_url: Joi.string().uri().optional(),
  contenido_texto: Joi.string().optional(),
  video_url: Joi.string().uri().optional(),
  mostrar_chat: Joi.boolean().default(true),
  mostrar_notificaciones: Joi.boolean().default(true),
  intervalo_actualizacion: Joi.number().integer().min(10).max(300).default(30)
});

const updateTotemSchema = Joi.object({
  nombre_to: Joi.string().min(3).max(100).optional(),
  ubicacion: Joi.string().min(5).max(200).optional(),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
  descripcion: Joi.string().max(1000).optional(),
  activo: Joi.boolean().optional(),
  institucion_id: Joi.number().integer().positive().optional(),
  categoria_id: Joi.number().integer().positive().optional(),
  region_id: Joi.number().integer().positive().optional(),
  plantilla_id: Joi.number().integer().positive().optional(),
  login_sitio: Joi.string().alphanum().min(3).max(100).optional(),
  password_sitio: Joi.string().min(6).optional(),
  chatpdf_url: Joi.string().uri().optional(),
  contenido_texto: Joi.string().optional(),
  video_url: Joi.string().uri().optional(),
  mostrar_chat: Joi.boolean().optional(),
  mostrar_notificaciones: Joi.boolean().optional(),
  intervalo_actualizacion: Joi.number().integer().min(10).max(300).optional()
});

// Rutas públicas
router.get('/', validateQuery(paginationSchema), getAllTotems);
router.get('/:id', validateParams(idSchema), getTotemById);
router.get('/:id/multimedia', validateParams(idSchema), getTotemMultimedia);
router.get('/:id/notificaciones', validateParams(idSchema), getTotemNotificaciones);
router.get('/:id/chats', validateParams(idSchema), getTotemChats);

// Rutas protegidas (solo admin)
router.post('/', authenticateToken, requireAdmin, validateRequest(totemSchema), createTotem);
router.put('/:id', authenticateToken, requireAdmin, validateParams(idSchema), validateRequest(updateTotemSchema), updateTotem);
router.delete('/:id', authenticateToken, requireAdmin, validateParams(idSchema), deleteTotem);
router.put('/:id/toggle', authenticateToken, requireAdmin, validateParams(idSchema), toggleTotemStatus);

export default router;