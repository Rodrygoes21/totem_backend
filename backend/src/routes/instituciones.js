import express from 'express';
import {
  getAllInstituciones,
  getInstitucionById,
  createInstitucion,
  updateInstitucion,
  deleteInstitucion,
  toggleInstitucionStatus
} from '../controllers/institucionController.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';
import { validateRequest, validateParams, validateQuery, paginationSchema, idSchema } from '../middlewares/validation.js';
import Joi from 'joi';

const router = express.Router();

// Schemas de validación
const institucionSchema = Joi.object({
  nombre: Joi.string().min(3).max(100).required(),
  descripcion: Joi.string().max(1000).optional(),
  direccion: Joi.string().max(200).optional(),
  telefono: Joi.string().max(20).optional(),
  email: Joi.string().email().optional(),
  activo: Joi.boolean().default(true)
});

const updateInstitucionSchema = Joi.object({
  nombre: Joi.string().min(3).max(100).optional(),
  descripcion: Joi.string().max(1000).optional(),
  direccion: Joi.string().max(200).optional(),
  telefono: Joi.string().max(20).optional(),
  email: Joi.string().email().optional(),
  activo: Joi.boolean().optional()
});

// Rutas públicas
router.get('/', validateQuery(paginationSchema), getAllInstituciones);
router.get('/:id', validateParams(idSchema), getInstitucionById);

// Rutas protegidas (solo admin)
router.post('/', authenticateToken, requireAdmin, validateRequest(institucionSchema), createInstitucion);
router.put('/:id', authenticateToken, requireAdmin, validateParams(idSchema), validateRequest(updateInstitucionSchema), updateInstitucion);
router.delete('/:id', authenticateToken, requireAdmin, validateParams(idSchema), deleteInstitucion);
router.put('/:id/toggle', authenticateToken, requireAdmin, validateParams(idSchema), toggleInstitucionStatus);

export default router;