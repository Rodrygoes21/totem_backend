import express from 'express';
import {
  getAllRegiones,
  getRegionById,
  createRegion,
  updateRegion,
  deleteRegion,
  toggleRegionStatus
} from '../controllers/regionController.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';
import { validateRequest, validateParams, validateQuery, paginationSchema, idSchema } from '../middlewares/validation.js';
import Joi from 'joi';

const router = express.Router();

// Schemas de validación
const regionSchema = Joi.object({
  nombre: Joi.string().min(3).max(100).required(),
  descripcion: Joi.string().max(500).optional(),
  activo: Joi.boolean().default(true)
});

const updateRegionSchema = Joi.object({
  nombre: Joi.string().min(3).max(100).optional(),
  descripcion: Joi.string().max(500).optional(),
  activo: Joi.boolean().optional()
});

// Rutas públicas
router.get('/', validateQuery(paginationSchema), getAllRegiones);
router.get('/:id', validateParams(idSchema), getRegionById);

// Rutas protegidas (solo admin)
router.post('/', authenticateToken, requireAdmin, validateRequest(regionSchema), createRegion);
router.put('/:id', authenticateToken, requireAdmin, validateParams(idSchema), validateRequest(updateRegionSchema), updateRegion);
router.delete('/:id', authenticateToken, requireAdmin, validateParams(idSchema), deleteRegion);
router.put('/:id/toggle', authenticateToken, requireAdmin, validateParams(idSchema), toggleRegionStatus);

export default router;
