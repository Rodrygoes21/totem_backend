export const ROLES = {
  ADMIN: 'admin',
  USUARIO: 'usuario',
  MODERADOR: 'moderador'
};

export const ESTADOS_CHAT = {
  PENDIENTE: 'pendiente',
  RESPONDIDA: 'respondida',
  CERRADA: 'cerrada'
};

export const TIPOS_MULTIMEDIA = {
  IMAGEN: 'imagen',
  VIDEO: 'video',
  AUDIO: 'audio',
  DOCUMENTO: 'documento'
};

export const TIPOS_NOTIFICACION = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  SUCCESS: 'success'
};

export const PRIORIDADES_NOTIFICACION = {
  BAJA: 'baja',
  MEDIA: 'media',
  ALTA: 'alta',
  URGENTE: 'urgente'
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100
};

