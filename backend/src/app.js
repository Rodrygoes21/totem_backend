import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { router as apiRouter } from './routes/index.js';
import { specs, swaggerUi } from './config/swagger.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { requestLogger } from './middlewares/logger.js';
import db from './models/index.js';

const app = express();

// Configuración de CORS
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = process.env.APP_ORIGIN
  ? process.env.APP_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean)
  : [];

app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir requests sin origin (curl, mobile apps, server-to-server)
      if (!origin) return callback(null, true);
      // En desarrollo permitir cualquier origin
      if (!isProduction) return callback(null, true);
      // En producción, solo permitir origins listados
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
  })
);

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

// Ruta de salud
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Documentación Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'TOTEM API Documentation'
}));

// Rutas de la API
app.use('/api', apiRouter);

// Middleware de manejo de errores
app.use(notFoundHandler);
app.use(errorHandler);

// Función para inicializar la base de datos
const initializeDatabase = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente');
    
    // Sincronizar modelos (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      await db.sequelize.sync({ alter: true });
      console.log('✅ Modelos sincronizados con la base de datos');
    }
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    process.exit(1);
  }
};

// Inicializar la aplicación
const startServer = async () => {
  await initializeDatabase();
  
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${port}`);
    console.log(`📚 Documentación API disponible en http://localhost:${port}/api/docs`);
    console.log(`🏥 Health check disponible en http://localhost:${port}/health`);
  });
};

// Manejo de señales de terminación
process.on('SIGTERM', async () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  await db.sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT recibido, cerrando servidor...');
  await db.sequelize.close();
  process.exit(0);
});

export default app;

// Iniciar servidor si este archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer().catch((error) => {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  });
}

