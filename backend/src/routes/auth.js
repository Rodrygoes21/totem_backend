import express from 'express';
import {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword
} from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validation.js';
import Joi from 'joi';

const router = express.Router();

// Schemas de validación
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  rol: Joi.string().valid('admin', 'usuario', 'moderador').default('usuario'),
  region_id: Joi.number().integer().positive().optional()
});

const updateProfileSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).optional(),
  email: Joi.string().email().optional(),
  region_id: Joi.number().integer().positive().optional()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

// Rutas públicas
router.post('/login', validateRequest(loginSchema), login);
router.post('/register', validateRequest(registerSchema), register);

// Rutas protegidas
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, validateRequest(updateProfileSchema), updateProfile);
router.put('/change-password', authenticateToken, validateRequest(changePasswordSchema), changePassword);

export default router;

