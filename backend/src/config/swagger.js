import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TOTEM Backend API',
      version: '1.0.0',
      description: 'API completa para el sistema TOTEM con autenticación JWT, CRUD completo y funcionalidades avanzadas',
      contact: {
        name: 'TOTEM Team',
        email: 'admin@totem.com'
      }
    },
    servers: [
      {
        url: process.env.FRONTEND_URL || 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Usuario: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            username: { type: 'string' },
            email: { type: 'string', format: 'email' },
            rol: { type: 'string', enum: ['admin', 'usuario', 'moderador'] },
            region_id: { type: 'integer' },
            activo: { type: 'boolean' },
            fecha_creacion: { type: 'string', format: 'date-time' },
            fecha_actualizacion: { type: 'string', format: 'date-time' }
          }
        },
        Totem: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nombre_to: { type: 'string' },
            ubicacion: { type: 'string' },
            color: { type: 'string', pattern: '^#[0-9A-F]{6}$' },
            descripcion: { type: 'string' },
            activo: { type: 'boolean' },
            institucion_id: { type: 'integer' },
            categoria_id: { type: 'integer' },
            region_id: { type: 'integer' },
            plantilla_id: { type: 'integer' },
            login_sitio: { type: 'string' },
            password_sitio: { type: 'string' },
            chatpdf_url: { type: 'string', format: 'uri' },
            contenido_texto: { type: 'string' },
            video_url: { type: 'string', format: 'uri' },
            mostrar_chat: { type: 'boolean' },
            mostrar_notificaciones: { type: 'boolean' },
            intervalo_actualizacion: { type: 'integer', minimum: 10, maximum: 300 },
            fecha_creacion: { type: 'string', format: 'date-time' },
            fecha_actualizacion: { type: 'string', format: 'date-time' }
          }
        },
        Multimedia: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            tipo_multimedia: { type: 'string', enum: ['imagen', 'video', 'audio', 'documento'] },
            url: { type: 'string', format: 'uri' },
            titulo: { type: 'string' },
            descripcion: { type: 'string' },
            totem_id: { type: 'integer' },
            orden: { type: 'integer' },
            activo: { type: 'boolean' },
            fecha_creacion: { type: 'string', format: 'date-time' }
          }
        },
        Notificacion: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            titulo: { type: 'string' },
            mensaje: { type: 'string' },
            tipo: { type: 'string', enum: ['info', 'warning', 'error', 'success'] },
            prioridad: { type: 'string', enum: ['baja', 'media', 'alta', 'urgente'] },
            totem_id: { type: 'integer' },
            fecha_inicio: { type: 'string', format: 'date-time' },
            fecha_fin: { type: 'string', format: 'date-time' },
            activo: { type: 'boolean' },
            leida: { type: 'boolean' },
            fecha_creacion: { type: 'string', format: 'date-time' }
          }
        },
        UserChat: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            totem_id: { type: 'integer' },
            pregunta: { type: 'string' },
            respuesta: { type: 'string' },
            usuario_id: { type: 'integer' },
            estado: { type: 'string', enum: ['pendiente', 'respondida', 'cerrada'] },
            fecha_pregunta: { type: 'string', format: 'date-time' },
            fecha_respuesta: { type: 'string', format: 'date-time' },
            ip_address: { type: 'string' },
            user_agent: { type: 'string' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            error: { type: 'string' },
            code: { type: 'string' }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            pages: { type: 'integer' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };

