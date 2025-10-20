import express from 'express';
import {
  getAllUserChats,
  getUserChatById,
  createUserChat,
  updateUserChat,
  deleteUserChat,
  closeUserChat,
  getChatsPendientes,
  getChatsByTotem,
  getChatStats
} from '../controllers/userchatController.js';
import { authenticateToken, requireModerator } from '../middlewares/auth.js';
import { validateRequest, validateParams, validateQuery, paginationSchema, idSchema } from '../middlewares/validation.js';
import Joi from 'joi';

const router = express.Router();

// Schemas de validación
const userChatSchema = Joi.object({
  totem_id: Joi.number().integer().positive().required(),
  pregunta: Joi.string().min(10).max(1000).required(),
  usuario_id: Joi.number().integer().positive().optional(),
  ip_address: Joi.string().ip().optional(),
  user_agent: Joi.string().optional()
});

const updateUserChatSchema = Joi.object({
  respuesta: Joi.string().min(10).max(1000).optional(),
  estado: Joi.string().valid('pendiente', 'respondida', 'cerrada').optional()
});

// Rutas públicas (para usuarios anónimos)
router.post('/', validateRequest(userChatSchema), createUserChat);

// Rutas protegidas
router.get('/', authenticateToken, requireModerator, validateQuery(paginationSchema), getAllUserChats);
router.get('/pendientes', authenticateToken, requireModerator, validateQuery(paginationSchema), getChatsPendientes);
router.get('/stats', authenticateToken, requireModerator, getChatStats);
router.get('/totem/:totem_id', authenticateToken, requireModerator, validateQuery(paginationSchema), getChatsByTotem);
router.get('/:id', authenticateToken, requireModerator, validateParams(idSchema), getUserChatById);

router.put('/:id', authenticateToken, requireModerator, validateParams(idSchema), validateRequest(updateUserChatSchema), updateUserChat);
router.put('/:id/cerrar', authenticateToken, requireModerator, validateParams(idSchema), closeUserChat);
router.delete('/:id', authenticateToken, requireModerator, validateParams(idSchema), deleteUserChat);

export default router;