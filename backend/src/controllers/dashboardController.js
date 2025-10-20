import db from '../models/index.js';
import { createError } from '../middlewares/errorHandler.js';
import { HTTP_STATUS } from '../utils/constants.js';

const { Totem, Notificacion, Usuario, UserChat, Multimedia, Institucion, Categoria, Region } = db;

export const getDashboardStats = async (req, res, next) => {
  try {
    // Estadísticas generales
    const [
      totalTotems,
      totemsActivos,
      totalNotificaciones,
      notificacionesActivas,
      totalUsuarios,
      chatsPendientes,
      totalMultimedia,
      totalInstituciones,
      totalCategorias,
      totalRegiones
    ] = await Promise.all([
      Totem.count(),
      Totem.count({ where: { activo: true } }),
      Notificacion.count(),
      Notificacion.count({ where: { activo: true } }),
      Usuario.count({ where: { activo: true } }),
      UserChat.count({ where: { estado: 'pendiente' } }),
      Multimedia.count({ where: { activo: true } }),
      Institucion.count({ where: { activo: true } }),
      Categoria.count({ where: { activo: true } }),
      Region.count({ where: { activo: true } })
    ]);

    // Estadísticas de chats por estado
    const chatStats = await UserChat.findAll({
      attributes: [
        'estado',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count']
      ],
      group: ['estado'],
      raw: true
    });

    // Estadísticas de multimedia por tipo
    const multimediaStats = await Multimedia.findAll({
      attributes: [
        'tipo_multimedia',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count']
      ],
      where: { activo: true },
      group: ['tipo_multimedia'],
      raw: true
    });

    // Estadísticas de notificaciones por tipo
    const notificacionStats = await Notificacion.findAll({
      attributes: [
        'tipo',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count']
      ],
      where: { activo: true },
      group: ['tipo'],
      raw: true
    });

    res.json({
      success: true,
      data: {
        total_totems: totalTotems,
        totems_activos: totemsActivos,
        totems_inactivos: totalTotems - totemsActivos,
        total_notificaciones: totalNotificaciones,
        notificaciones_activas: notificacionesActivas,
        total_usuarios: totalUsuarios,
        chats_pendientes: chatsPendientes,
        total_multimedia: totalMultimedia,
        total_instituciones: totalInstituciones,
        total_categorias: totalCategorias,
        total_regiones: totalRegiones,
        chat_stats: chatStats,
        multimedia_stats: multimediaStats,
        notificacion_stats: notificacionStats
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getTotemsByRegion = async (req, res, next) => {
  try {
    const totemsByRegion = await Region.findAll({
      attributes: [
        'id',
        'nombre',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('totems.id')), 'total_totems'],
        [db.Sequelize.fn('COUNT', db.Sequelize.literal('CASE WHEN totems.activo = true THEN 1 END')), 'totems_activos']
      ],
      include: [{
        model: Totem,
        as: 'totems',
        attributes: [],
        required: false
      }],
      group: ['Region.id', 'Region.nombre'],
      order: [['Region.nombre', 'ASC']],
      raw: false
    });

    res.json({
      success: true,
      data: totemsByRegion
    });
  } catch (error) {
    next(error);
  }
};

export const getNotificacionesRecientes = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const notificaciones = await Notificacion.findAll({
      where: { activo: true },
      include: [{
        model: Totem,
        as: 'totem',
        attributes: ['id', 'nombre_to', 'ubicacion']
      }],
      order: [['fecha_inicio', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: notificaciones
    });
  } catch (error) {
    next(error);
  }
};

export const getTotemsByInstitucion = async (req, res, next) => {
  try {
    const totemsByInstitucion = await Institucion.findAll({
      attributes: [
        'id',
        'nombre',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('totems.id')), 'total_totems'],
        [db.Sequelize.fn('COUNT', db.Sequelize.literal('CASE WHEN totems.activo = true THEN 1 END')), 'totems_activos']
      ],
      include: [{
        model: Totem,
        as: 'totems',
        attributes: [],
        required: false
      }],
      group: ['Institucion.id', 'Institucion.nombre'],
      order: [['Institucion.nombre', 'ASC']],
      raw: false
    });

    res.json({
      success: true,
      data: totemsByInstitucion
    });
  } catch (error) {
    next(error);
  }
};

export const getTotemsByCategoria = async (req, res, next) => {
  try {
    const totemsByCategoria = await Categoria.findAll({
      attributes: [
        'id',
        'nombre',
        'color',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('totems.id')), 'total_totems'],
        [db.Sequelize.fn('COUNT', db.Sequelize.literal('CASE WHEN totems.activo = true THEN 1 END')), 'totems_activos']
      ],
      include: [{
        model: Totem,
        as: 'totems',
        attributes: [],
        required: false
      }],
      group: ['Categoria.id', 'Categoria.nombre', 'Categoria.color'],
      order: [['Categoria.nombre', 'ASC']],
      raw: false
    });

    res.json({
      success: true,
      data: totemsByCategoria
    });
  } catch (error) {
    next(error);
  }
};

export const getActivityStats = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Chats creados en los últimos días
    const chatsCreated = await UserChat.count({
      where: {
        fecha_pregunta: {
          [db.Sequelize.Op.gte]: startDate
        }
      }
    });

    // Notificaciones creadas en los últimos días
    const notificacionesCreated = await Notificacion.count({
      where: {
        fecha_creacion: {
          [db.Sequelize.Op.gte]: startDate
        }
      }
    });

    // Multimedia creada en los últimos días
    const multimediaCreated = await Multimedia.count({
      where: {
        fecha_creacion: {
          [db.Sequelize.Op.gte]: startDate
        }
      }
    });

    // Totems creados en los últimos días
    const totemsCreated = await Totem.count({
      where: {
        fecha_creacion: {
          [db.Sequelize.Op.gte]: startDate
        }
      }
    });

    // Usuarios creados en los últimos días
    const usuariosCreated = await Usuario.count({
      where: {
        fecha_creacion: {
          [db.Sequelize.Op.gte]: startDate
        }
      }
    });

    res.json({
      success: true,
      data: {
        period: `${days} días`,
        chats_created: chatsCreated,
        notificaciones_created: notificacionesCreated,
        multimedia_created: multimediaCreated,
        totems_created: totemsCreated,
        usuarios_created: usuariosCreated
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getSystemHealth = async (req, res, next) => {
  try {
    // Verificar conexión a la base de datos
    await db.sequelize.authenticate();

    // Obtener estadísticas de la base de datos
    const dbStats = await db.sequelize.query('SHOW STATUS LIKE "Threads_connected"', {
      type: db.Sequelize.QueryTypes.SELECT
    });

    const connectedThreads = dbStats[0]?.Value || 0;

    res.json({
      success: true,
      data: {
        status: 'healthy',
        database: 'connected',
        connected_threads: parseInt(connectedThreads),
        uptime: process.uptime(),
        memory_usage: process.memoryUsage(),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      data: {
        status: 'unhealthy',
        database: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
};

