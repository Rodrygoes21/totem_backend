import winston from 'winston';
import { HTTP_STATUS } from '../utils/constants.js';

// Configuración del logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'totem-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

export { logger };

export const errorHandler = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Error de Sequelize
  if (err.name === 'SequelizeValidationError') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Error de validación de datos',
      error: err.errors.map(e => e.message),
      code: 'SEQUELIZE_VALIDATION_ERROR'
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      message: 'El recurso ya existe',
      error: err.errors.map(e => e.message),
      code: 'SEQUELIZE_UNIQUE_ERROR'
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Referencia inválida',
      error: 'El recurso referenciado no existe',
      code: 'FOREIGN_KEY_ERROR'
    });
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Token inválido',
      code: 'JWT_ERROR'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Token expirado',
      code: 'JWT_EXPIRED'
    });
  }

  // Error personalizado
  if (err.isOperational) {
    return res.status(err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: err.message,
      code: err.code || 'OPERATIONAL_ERROR'
    });
  }

  // Error genérico
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : err.message,
    code: 'INTERNAL_ERROR'
  });
};

export const notFoundHandler = (req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: 'Endpoint no encontrado',
    code: 'NOT_FOUND'
  });
};

export const createError = (message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, code = 'ERROR') => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.isOperational = true;
  return error;
};

