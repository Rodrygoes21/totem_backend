import morgan from 'morgan';
import { logger } from './errorHandler.js';

// Configuración personalizada de Morgan para logging
const morganFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';

export const requestLogger = morgan(morganFormat, {
  stream: {
    write: (message) => {
      logger.info(message.trim());
    }
  }
});

export const logRequest = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id || null
    });
  });
  
  next();
};

