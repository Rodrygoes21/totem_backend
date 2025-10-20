import express from 'express';
import {
  getAllCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  toggleCategoriaStatus
} from '../controllers/categoriaController.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';
import { validateRequest, validateParams, validateQuery, paginationSchema, idSchema } from '../middlewares/validation.js';
import Joi from 'joi';

const router = express.Router();

// Schemas de validación
const categoriaSchema = Joi.object({
  nombre: Joi.string().min(3).max(50).required(),
  informacion: Joi.string().max(1000).optional(),
  icon: Joi.string().max(100).optional(),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).default('#3498db'),
  activo: Joi.boolean().default(true)
});

const updateCategoriaSchema = Joi.object({
  nombre: Joi.string().min(3).max(50).optional(),
  informacion: Joi.string().max(1000).optional(),
  icon: Joi.string().max(100).optional(),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
  activo: Joi.boolean().optional()
});

// Rutas públicas
router.get('/', validateQuery(paginationSchema), getAllCategorias);
router.get('/:id', validateParams(idSchema), getCategoriaById);

// Rutas protegidas (solo admin)
router.post('/', authenticateToken, requireAdmin, validateRequest(categoriaSchema), createCategoria);
router.put('/:id', authenticateToken, requireAdmin, validateParams(idSchema), validateRequest(updateCategoriaSchema), updateCategoria);
router.delete('/:id', authenticateToken, requireAdmin, validateParams(idSchema), deleteCategoria);
router.put('/:id/toggle', authenticateToken, requireAdmin, validateParams(idSchema), toggleCategoriaStatus);

export default router;