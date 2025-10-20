import jwt from 'jsonwebtoken';
import { HTTP_STATUS, ROLES } from '../utils/constants.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Token de acceso requerido',
      code: 'TOKEN_REQUIRED'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Token inválido o expirado',
      code: 'TOKEN_INVALID'
    });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user.rol !== ROLES.ADMIN) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de administrador',
      code: 'ADMIN_REQUIRED'
    });
  }
  next();
};

export const requireModerator = (req, res, next) => {
  if (![ROLES.ADMIN, ROLES.MODERADOR].includes(req.user.rol)) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'Acceso denegado. Se requiere rol de moderador o administrador',
      code: 'MODERATOR_REQUIRED'
    });
  }
  next();
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Acceso denegado. Rol insuficiente',
        code: 'INSUFFICIENT_ROLE'
      });
    }
    next();
  };
};

