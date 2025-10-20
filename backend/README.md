# 🟢 TOTEM Backend API

Backend completo para el sistema TOTEM desarrollado con Node.js, Express, MySQL y Sequelize.

## ⚙️ Tecnologías

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Base de datos:** MySQL
- **ORM:** Sequelize
- **Autenticación:** JWT + bcryptjs
- **Validación:** Joi
- **Documentación:** Swagger UI
- **Variables de entorno:** dotenv
- **CORS:** habilitado para frontend
- **Logging:** Winston + Morgan

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd totemDb
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Copia el archivo `env.example` y renómbralo a `.env`:
```bash
cp env.example .env
```

Edita el archivo `.env` con tus configuraciones:
```env
# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASS=tu_password
DB_NAME=totem_db

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura
JWT_EXPIRES_IN=24h

# Servidor
PORT=3000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173
APP_ORIGIN=http://localhost:5173,http://localhost:3000

# Uploads
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

### 4. Configurar la base de datos
1. Crea la base de datos MySQL:
```sql
CREATE DATABASE totem_db;
```

2. Ejecuta el script SQL para crear las tablas:
```bash
mysql -u root -p totem_db < totem.sql
```

### 5. Ejecutar el servidor
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📚 Documentación API

La documentación completa de la API está disponible en:
- **Swagger UI:** `http://localhost:3000/api/docs`
- **Health Check:** `http://localhost:3000/health`

## 🧩 Estructura del Proyecto

```
src/
├── config/
│   ├── database.js      # Configuración de Sequelize
│   ├── index.js         # Configuración general
│   └── swagger.js       # Configuración de Swagger
├── controllers/
│   ├── authController.js
│   ├── regionController.js
│   ├── usuarioController.js
│   ├── institucionController.js
│   ├── categoriaController.js
│   ├── plantillaController.js
│   ├── totemController.js
│   ├── multimediaController.js
│   ├── notificacionController.js
│   ├── userchatController.js
│   ├── configuracionController.js
│   └── dashboardController.js
├── middlewares/
│   ├── auth.js          # Autenticación JWT
│   ├── validation.js    # Validación con Joi
│   ├── errorHandler.js  # Manejo de errores
│   └── logger.js        # Logging
├── models/
│   ├── index.js         # Configuración de modelos
│   ├── Region.js
│   ├── Usuario.js
│   ├── Institucion.js
│   ├── Categoria.js
│   ├── PlantillaColor.js
│   ├── Totem.js
│   ├── Multimedia.js
│   ├── Notificacion.js
│   ├── UserChat.js
│   ├── LogActividad.js
│   └── ConfiguracionSistema.js
├── routes/
│   ├── index.js         # Rutas principales
│   ├── auth.js
│   ├── regiones.js
│   ├── usuarios.js
│   ├── instituciones.js
│   ├── categorias.js
│   ├── plantillas.js
│   ├── totems.js
│   ├── multimedia.js
│   ├── notificaciones.js
│   ├── userchat.js
│   ├── configuracion.js
│   └── dashboard.js
├── utils/
│   ├── hashPassword.js  # Funciones de hash
│   ├── generateToken.js # Generación de JWT
│   └── constants.js     # Constantes del sistema
├── app.js               # Configuración principal
└── server.js            # Punto de entrada
```

## 🔐 Autenticación

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@totem.com",
  "password": "admin123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@totem.com",
    "rol": "admin",
    "region_id": 1
  }
}
```

### Uso del Token
Incluye el token en el header Authorization:
```
Authorization: Bearer <token>
```

## 🧠 Endpoints Principales

### 🔐 Autenticación (`/api/auth`)
- `POST /login` - Iniciar sesión
- `POST /register` - Registro de usuario
- `GET /profile` - Obtener perfil del usuario
- `PUT /profile` - Actualizar perfil
- `PUT /change-password` - Cambiar contraseña

### 🌍 Regiones (`/api/regiones`)
- `GET /` - Listar regiones
- `GET /:id` - Obtener región por ID
- `POST /` - Crear región (admin)
- `PUT /:id` - Actualizar región (admin)
- `DELETE /:id` - Eliminar región (admin)
- `PUT /:id/toggle` - Activar/desactivar región (admin)

### 👥 Usuarios (`/api/usuarios`)
- `GET /` - Listar usuarios (moderador+)
- `GET /:id` - Obtener usuario por ID
- `POST /` - Crear usuario (admin)
- `PUT /:id` - Actualizar usuario (admin)
- `DELETE /:id` - Eliminar usuario (admin)
- `PUT /:id/role` - Cambiar rol (admin)
- `PUT /:id/toggle` - Activar/desactivar usuario (admin)

### 🏢 Instituciones (`/api/instituciones`)
- `GET /` - Listar instituciones
- `GET /:id` - Obtener institución por ID
- `POST /` - Crear institución (admin)
- `PUT /:id` - Actualizar institución (admin)
- `DELETE /:id` - Eliminar institución (admin)
- `PUT /:id/toggle` - Activar/desactivar institución (admin)

### 📂 Categorías (`/api/categorias`)
- `GET /` - Listar categorías
- `GET /:id` - Obtener categoría por ID
- `POST /` - Crear categoría (admin)
- `PUT /:id` - Actualizar categoría (admin)
- `DELETE /:id` - Eliminar categoría (admin)
- `PUT /:id/toggle` - Activar/desactivar categoría (admin)

### 🎨 Plantillas (`/api/plantillas`)
- `GET /` - Listar plantillas
- `GET /:id` - Obtener plantilla por ID
- `POST /` - Crear plantilla (admin)
- `PUT /:id` - Actualizar plantilla (admin)
- `DELETE /:id` - Eliminar plantilla (admin)
- `PUT /:id/toggle` - Activar/desactivar plantilla (admin)

### 🗿 TOTEMs (`/api/totems`) - **PRINCIPAL**
- `GET /` - Listar totems con filtros
- `GET /:id` - Obtener totem por ID con multimedia
- `POST /` - Crear totem (admin)
- `PUT /:id` - Actualizar totem (admin)
- `DELETE /:id` - Eliminar totem (admin)
- `PUT /:id/toggle` - Activar/desactivar totem (admin)
- `GET /:id/multimedia` - Obtener multimedia del totem
- `GET /:id/notificaciones` - Obtener notificaciones del totem
- `GET /:id/chats` - Obtener chats del totem

### 📷 Multimedia (`/api/multimedia`)
- `GET /` - Listar multimedia con filtros
- `GET /:id` - Obtener multimedia por ID
- `POST /` - Crear multimedia (moderador+)
- `PUT /:id` - Actualizar multimedia (moderador+)
- `DELETE /:id` - Eliminar multimedia (admin)
- `PUT /:id/toggle` - Activar/desactivar multimedia (moderador+)
- `POST /upload` - Subir archivo (moderador+)
- `PUT /reorder` - Reordenar multimedia (moderador+)

### 🔔 Notificaciones (`/api/notificaciones`)
- `GET /` - Listar notificaciones con filtros
- `GET /activas` - Obtener notificaciones activas
- `GET /:id` - Obtener notificación por ID
- `POST /` - Crear notificación (moderador+)
- `PUT /:id` - Actualizar notificación (moderador+)
- `DELETE /:id` - Eliminar notificación (admin)
- `PUT /:id/toggle` - Activar/desactivar notificación (moderador+)
- `PUT /:id/read` - Marcar como leída

### 💬 UserChat (`/api/userchat`)
- `GET /` - Listar chats (moderador+)
- `GET /pendientes` - Obtener chats pendientes (moderador+)
- `GET /stats` - Estadísticas de chats (moderador+)
- `GET /totem/:totem_id` - Chats por totem (moderador+)
- `GET /:id` - Obtener chat por ID (moderador+)
- `POST /` - Crear nueva pregunta (público)
- `PUT /:id` - Responder chat (moderador+)
- `PUT /:id/cerrar` - Cerrar chat (moderador+)
- `DELETE /:id` - Eliminar chat (moderador+)

### ⚙️ Configuración (`/api/configuracion`)
- `GET /` - Obtener configuración del sistema
- `GET /categorias` - Obtener categorías de configuración
- `GET /:clave` - Obtener configuración por clave
- `POST /` - Crear configuración (admin)
- `PUT /` - Actualizar múltiples configuraciones (admin)
- `PUT /:clave` - Actualizar configuración individual (admin)
- `DELETE /:clave` - Eliminar configuración (admin)
- `PUT /:clave/reset` - Restablecer configuración (admin)

### 📊 Dashboard (`/api/dashboard`)
- `GET /stats` - Estadísticas generales (moderador+)
- `GET /totems-by-region` - Totems por región (moderador+)
- `GET /notificaciones-recientes` - Notificaciones recientes (moderador+)
- `GET /totems-by-institucion` - Totems por institución (moderador+)
- `GET /totems-by-categoria` - Totems por categoría (moderador+)
- `GET /activity-stats` - Estadísticas de actividad (moderador+)
- `GET /system-health` - Estado del sistema (moderador+)

## 🔧 Funcionalidades Especiales

### Filtros y Búsquedas
```bash
# Ejemplo para TOTEMs
GET /api/totems?region_id=1&activo=true&search=principal&page=1&limit=10
```

### Paginación
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### Respuestas Estandarizadas
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": {...}
}
```

### Manejo de Errores
```json
{
  "success": false,
  "message": "Error descriptivo",
  "error": "Detalles del error",
  "code": "ERROR_CODE"
}
```

## 🛡️ Roles y Permisos

- **admin:** Acceso completo a todas las funcionalidades
- **moderador:** Puede gestionar contenido y responder chats
- **usuario:** Acceso limitado de solo lectura

## 📝 Scripts Disponibles

```bash
# Desarrollo con auto-reload
npm run dev

# Producción
npm start

# Linting (si está configurado)
npm run lint

# Tests (si están configurados)
npm test
```

## 🔍 Logging

Los logs se guardan en:
- `logs/error.log` - Solo errores
- `logs/combined.log` - Todos los logs
- Consola en desarrollo

## 🚨 Manejo de Errores

El sistema incluye manejo global de errores para:
- Errores de Sequelize (validación, únicos, foreign keys)
- Errores de JWT (inválido, expirado)
- Errores operacionales personalizados
- Errores genéricos del servidor

## 🔄 Base de Datos

### Modelos Principales
- **Usuario:** Gestión de usuarios y autenticación
- **Region:** Regiones geográficas
- **Institucion:** Instituciones que usan el sistema
- **Categoria:** Categorías de contenido
- **PlantillaColor:** Plantillas de diseño
- **Totem:** Dispositivos TOTEM principales
- **Multimedia:** Archivos multimedia asociados
- **Notificacion:** Notificaciones del sistema
- **UserChat:** Sistema de chat con usuarios
- **LogActividad:** Auditoría de actividades
- **ConfiguracionSistema:** Configuraciones del sistema

### Relaciones
- Usuario → Region (muchos a uno)
- Totem → Institucion, Categoria, Region, PlantillaColor (muchos a uno)
- Multimedia → Totem (muchos a uno)
- Notificacion → Totem (muchos a uno)
- UserChat → Totem, Usuario (muchos a uno)

## 🌐 CORS

Configurado para permitir:
- Desarrollo: Cualquier origin
- Producción: Solo origins especificados en `APP_ORIGIN`

## 📦 Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `DB_HOST` | Host de MySQL | localhost |
| `DB_USER` | Usuario de MySQL | root |
| `DB_PASS` | Contraseña de MySQL | password |
| `DB_NAME` | Nombre de la base de datos | totem_db |
| `JWT_SECRET` | Clave secreta para JWT | - |
| `JWT_EXPIRES_IN` | Expiración del token | 24h |
| `PORT` | Puerto del servidor | 3000 |
| `NODE_ENV` | Entorno de ejecución | development |
| `FRONTEND_URL` | URL del frontend | http://localhost:5173 |
| `APP_ORIGIN` | Origins permitidos para CORS | - |

## 🚀 Despliegue

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

### Docker (opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Soporte

Para soporte técnico, contacta a:
- Email: admin@totem.com
- Documentación: `http://localhost:3000/api/docs`

---

**¡El backend TOTEM está listo para usar! 🎉**