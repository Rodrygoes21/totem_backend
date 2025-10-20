import express from 'express';
import {
  getConfiguracion,
  getConfiguracionByKey,
  updateConfiguracion,
  updateSingleConfiguracion,
  createConfiguracion,
  deleteConfiguracion,
  getConfiguracionCategorias,
  resetConfiguracion
} from '../controllers/configuracionController.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';
import { validateRequest, validateParams } from '../middlewares/validation.js';
import Joi from 'joi';

const router = express.Router();

// Schemas de validación
const configuracionSchema = Joi.object({
  clave: Joi.string().min(3).max(100).required(),
  valor: Joi.any().required(),
  tipo: Joi.string().valid('string', 'number', 'boolean', 'json').default('string'),
  descripcion: Joi.string().max(500).optional(),
  categoria: Joi.string().max(50).default('general'),
  editable: Joi.boolean().default(true)
});

const updateConfiguracionSchema = Joi.object({
  configuraciones: Joi.array().items(
    Joi.object({
      clave: Joi.string().required(),
      valor: Joi.any().required()
    })
  ).required()
});

const updateSingleConfiguracionSchema = Joi.object({
  valor: Joi.any().required()
});

// Rutas públicas (solo lectura)
router.get('/', getConfiguracion);
router.get('/categorias', getConfiguracionCategorias);
router.get('/:clave', getConfiguracionByKey);

// Rutas protegidas (solo admin)
router.post('/', authenticateToken, requireAdmin, validateRequest(configuracionSchema), createConfiguracion);
router.put('/', authenticateToken, requireAdmin, validateRequest(updateConfiguracionSchema), updateConfiguracion);
router.put('/:clave', authenticateToken, requireAdmin, validateRequest(updateSingleConfiguracionSchema), updateSingleConfiguracion);
router.delete('/:clave', authenticateToken, requireAdmin, deleteConfiguracion);
router.put('/:clave/reset', authenticateToken, requireAdmin, resetConfiguracion);

export default router;

