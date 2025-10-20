import express from 'express';
import {
  getAllUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  changeUserRole,
  toggleUsuarioStatus
} from '../controllers/usuarioController.js';
import { authenticateToken, requireAdmin, requireModerator } from '../middlewares/auth.js';
import { validateRequest, validateParams, validateQuery, paginationSchema, idSchema } from '../middlewares/validation.js';
import Joi from 'joi';

const router = express.Router();

// Schemas de validación
const usuarioSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  rol: Joi.string().valid('admin', 'usuario', 'moderador').default('usuario'),
  region_id: Joi.number().integer().positive().optional(),
  activo: Joi.boolean().default(true)
});

const updateUsuarioSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).optional(),
  email: Joi.string().email().optional(),
  rol: Joi.string().valid('admin', 'usuario', 'moderador').optional(),
  region_id: Joi.number().integer().positive().optional(),
  activo: Joi.boolean().optional()
});

const changeRoleSchema = Joi.object({
  rol: Joi.string().valid('admin', 'usuario', 'moderador').required()
});

// Rutas protegidas
router.get('/', authenticateToken, requireModerator, validateQuery(paginationSchema), getAllUsuarios);
router.get('/:id', authenticateToken, validateParams(idSchema), getUsuarioById);

// Rutas solo para admin
router.post('/', authenticateToken, requireAdmin, validateRequest(usuarioSchema), createUsuario);
router.put('/:id', authenticateToken, requireAdmin, validateParams(idSchema), validateRequest(updateUsuarioSchema), updateUsuario);
router.delete('/:id', authenticateToken, requireAdmin, validateParams(idSchema), deleteUsuario);
router.put('/:id/role', authenticateToken, requireAdmin, validateParams(idSchema), validateRequest(changeRoleSchema), changeUserRole);
router.put('/:id/toggle', authenticateToken, requireAdmin, validateParams(idSchema), toggleUsuarioStatus);

export default router;