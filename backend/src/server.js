import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();

// Configuración básica de CORS
app.use(cors({
  origin: true,
  credentials: true
}));

// Middlewares básicos
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ruta de salud básica
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'TOTEM Backend API is running!',
    port: process.env.PORT || 3000
  });
});

// Ruta de información básica
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'TOTEM Backend API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Función para inicializar la aplicación de forma segura
const startServer = async () => {
  try {
    console.log('🚀 Iniciando servidor TOTEM...');
    console.log('📊 Variables de entorno:');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- PORT:', process.env.PORT);
    console.log('- DB_HOST:', process.env.DB_HOST ? 'Configurado' : 'No configurado');
    console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'Configurado' : 'No configurado');
    
    const port = Number(process.env.PORT || 3000);
    
    // Intentar cargar los módulos de forma segura
    try {
      console.log('📚 Cargando documentación Swagger...');
      const { specs, swaggerUi } = await import('./config/swagger.js');
      
      app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'TOTEM API Documentation'
      }));
      console.log('✅ Swagger cargado correctamente');
    } catch (swaggerError) {
      console.log('⚠️ Error cargando Swagger:', swaggerError.message);
      console.log('⚠️ Continuando sin documentación');
    }
    
    try {
      console.log('🛣️ Cargando rutas de la API...');
      const { router: apiRouter } = await import('./routes/index.js');
      app.use('/api', apiRouter);
      console.log('✅ Rutas de API cargadas correctamente');
    } catch (routesError) {
      console.log('⚠️ Error cargando rutas:', routesError.message);
      console.log('⚠️ Continuando sin rutas de API');
    }
    
    try {
      console.log('🗄️ Intentando conectar a la base de datos...');
      const db = await import('./models/index.js');
      
      if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASS && process.env.DB_NAME) {
        await db.default.sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida correctamente');
        
        // Sincronizar modelos solo en desarrollo
        if (process.env.NODE_ENV === 'development') {
          await db.default.sequelize.sync({ alter: true });
          console.log('✅ Modelos sincronizados con la base de datos');
        }
      } else {
        console.log('⚠️ Variables de base de datos no configuradas, ejecutando sin DB');
      }
    } catch (dbError) {
      console.log('⚠️ Error de base de datos:', dbError.message);
      console.log('⚠️ Continuando sin base de datos');
    }
    
    // Middleware de manejo de errores básico
    app.use((err, req, res, next) => {
      console.error('❌ Error en la aplicación:', err);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
      });
    });
    
    // Middleware para rutas no encontradas
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: 'Endpoint no encontrado',
        path: req.path
      });
    });
    
    // Iniciar el servidor
    app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${port}`);
      console.log(`🌐 Servidor escuchando en todas las interfaces (0.0.0.0:${port})`);
      console.log(`🏥 Health check disponible en http://localhost:${port}/health`);
      console.log(`📚 Documentación API disponible en http://localhost:${port}/api/docs`);
      console.log(`✅ Servidor iniciado correctamente!`);
    });
    
  } catch (error) {
    console.error('❌ Error crítico al iniciar el servidor:', error);
    console.error('❌ Stack trace:', error.stack);
    process.exit(1);
  }
};

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT recibido, cerrando servidor...');
  process.exit(0);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  process.exit(1);
});

// Iniciar servidor
startServer().catch((error) => {
  console.error('❌ Error fatal al iniciar el servidor:', error);
  process.exit(1);
});

export default app;