import Joi from 'joi';
import { HTTP_STATUS } from '../utils/constants.js';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Datos de entrada inválidos',
        error: error.details[0].message,
        code: 'VALIDATION_ERROR'
      });
    }
    next();
  };
};

export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Parámetros de consulta inválidos',
        error: error.details[0].message,
        code: 'QUERY_VALIDATION_ERROR'
      });
    }
    next();
  };
};

export const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params);
    if (error) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Parámetros de ruta inválidos',
        error: error.details[0].message,
        code: 'PARAMS_VALIDATION_ERROR'
      });
    }
    next();
  };
};

// Schemas de validación comunes
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().max(100).optional()
});

export const idSchema = Joi.object({
  id: Joi.number().integer().positive().required()
});

// Schemas específicos para cada entidad
export const usuarioSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).required(),
  email: Joi.string().email().required(),
  contrasenia: Joi.string().min(6).required(),
  rol: Joi.string().valid('admin', 'usuario', 'moderador').default('usuario'),
  region_id: Joi.number().integer().positive().optional(),
  activo: Joi.boolean().default(true)
});

export const totemSchema = Joi.object({
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

export const multimediaSchema = Joi.object({
  tipo_multimedia: Joi.string().valid('imagen', 'video', 'audio', 'documento').required(),
  url: Joi.string().uri().required(),
  titulo: Joi.string().min(3).max(200).required(),
  descripcion: Joi.string().max(1000).optional(),
  totem_id: Joi.number().integer().positive().optional(),
  orden: Joi.number().integer().min(0).default(0),
  activo: Joi.boolean().default(true)
});

export const notificacionSchema = Joi.object({
  titulo: Joi.string().min(3).max(200).required(),
  mensaje: Joi.string().min(10).required(),
  tipo: Joi.string().valid('info', 'warning', 'error', 'success').default('info'),
  prioridad: Joi.string().valid('baja', 'media', 'alta', 'urgente').default('media'),
  totem_id: Joi.number().integer().positive().optional(),
  fecha_inicio: Joi.date().required(),
  fecha_fin: Joi.date().optional(),
  activo: Joi.boolean().default(true)
});

export const userChatSchema = Joi.object({
  totem_id: Joi.number().integer().positive().required(),
  pregunta: Joi.string().min(10).max(1000).required(),
  usuario_id: Joi.number().integer().positive().optional(),
  ip_address: Joi.string().ip().optional(),
  user_agent: Joi.string().optional()
});

