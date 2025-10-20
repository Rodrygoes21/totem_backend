import express from 'express';
import {
  getAllMultimedia,
  getMultimediaById,
  createMultimedia,
  updateMultimedia,
  deleteMultimedia,
  toggleMultimediaStatus,
  uploadMultimedia,
  reorderMultimedia
} from '../controllers/multimediaController.js';
import { authenticateToken, requireAdmin, requireModerator } from '../middlewares/auth.js';
import { validateRequest, validateParams, validateQuery, paginationSchema, idSchema } from '../middlewares/validation.js';
import Joi from 'joi';

const router = express.Router();

// Schemas de validación
const multimediaSchema = Joi.object({
  tipo_multimedia: Joi.string().valid('imagen', 'video', 'audio', 'documento').required(),
  url: Joi.string().uri().required(),
  titulo: Joi.string().min(3).max(200).required(),
  descripcion: Joi.string().max(1000).optional(),
  totem_id: Joi.number().integer().positive().optional(),
  orden: Joi.number().integer().min(0).default(0),
  activo: Joi.boolean().default(true)
});

const updateMultimediaSchema = Joi.object({
  tipo_multimedia: Joi.string().valid('imagen', 'video', 'audio', 'documento').optional(),
  url: Joi.string().uri().optional(),
  titulo: Joi.string().min(3).max(200).optional(),
  descripcion: Joi.string().max(1000).optional(),
  totem_id: Joi.number().integer().positive().optional(),
  orden: Joi.number().integer().min(0).optional(),
  activo: Joi.boolean().optional()
});

const uploadSchema = Joi.object({
  url: Joi.string().uri().required(),
  tipo_multimedia: Joi.string().valid('imagen', 'video', 'audio', 'documento').required(),
  titulo: Joi.string().min(3).max(200).required(),
  descripcion: Joi.string().max(1000).optional(),
  totem_id: Joi.number().integer().positive().optional()
});

const reorderSchema = Joi.object({
  multimediaItems: Joi.array().items(
    Joi.object({
      id: Joi.number().integer().positive().required(),
      orden: Joi.number().integer().min(0).required()
    })
  ).required()
});

// Rutas públicas
router.get('/', validateQuery(paginationSchema), getAllMultimedia);
router.get('/:id', validateParams(idSchema), getMultimediaById);

// Rutas protegidas
router.post('/', authenticateToken, requireModerator, validateRequest(multimediaSchema), createMultimedia);
router.put('/:id', authenticateToken, requireModerator, validateParams(idSchema), validateRequest(updateMultimediaSchema), updateMultimedia);
router.delete('/:id', authenticateToken, requireAdmin, validateParams(idSchema), deleteMultimedia);
router.put('/:id/toggle', authenticateToken, requireModerator, validateParams(idSchema), toggleMultimediaStatus);
router.post('/upload', authenticateToken, requireModerator, validateRequest(uploadSchema), uploadMultimedia);
router.put('/reorder', authenticateToken, requireModerator, validateRequest(reorderSchema), reorderMultimedia);

export default router;