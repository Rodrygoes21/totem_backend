import express from 'express';
import {
  getAllPlantillas,
  getPlantillaById,
  createPlantilla,
  updatePlantilla,
  deletePlantilla,
  togglePlantillaStatus
} from '../controllers/plantillaController.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';
import { validateRequest, validateParams, validateQuery, paginationSchema, idSchema } from '../middlewares/validation.js';
import Joi from 'joi';

const router = express.Router();

// Schemas de validación
const plantillaSchema = Joi.object({
  nombre: Joi.string().min(3).max(100).required(),
  color_principal: Joi.string().pattern(/^#[0-9A-F]{6}$/i).default('#3498db'),
  color_secundario: Joi.string().pattern(/^#[0-9A-F]{6}$/i).default('#2c3e50'),
  color_fondo: Joi.string().pattern(/^#[0-9A-F]{6}$/i).default('#ffffff'),
  color_texto: Joi.string().pattern(/^#[0-9A-F]{6}$/i).default('#000000'),
  descripcion: Joi.string().max(1000).optional(),
  activo: Joi.boolean().default(true)
});

const updatePlantillaSchema = Joi.object({
  nombre: Joi.string().min(3).max(100).optional(),
  color_principal: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
  color_secundario: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
  color_fondo: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
  color_texto: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
  descripcion: Joi.string().max(1000).optional(),
  activo: Joi.boolean().optional()
});

// Rutas públicas
router.get('/', validateQuery(paginationSchema), getAllPlantillas);
router.get('/:id', validateParams(idSchema), getPlantillaById);

// Rutas protegidas (solo admin)
router.post('/', authenticateToken, requireAdmin, validateRequest(plantillaSchema), createPlantilla);
router.put('/:id', authenticateToken, requireAdmin, validateParams(idSchema), validateRequest(updatePlantillaSchema), updatePlantilla);
router.delete('/:id', authenticateToken, requireAdmin, validateParams(idSchema), deletePlantilla);
router.put('/:id/toggle', authenticateToken, requireAdmin, validateParams(idSchema), togglePlantillaStatus);

export default router;
