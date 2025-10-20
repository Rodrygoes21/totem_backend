import db from '../models/index.js';
import { createError } from '../middlewares/errorHandler.js';
import { HTTP_STATUS, PAGINATION_DEFAULTS, TIPOS_NOTIFICACION, PRIORIDADES_NOTIFICACION } from '../utils/constants.js';

const { Notificacion, Totem } = db;

export const getAllNotificaciones = async (req, res, next) => {
  try {
    const { 
      page = PAGINATION_DEFAULTS.PAGE, 
      limit = PAGINATION_DEFAULTS.LIMIT, 
      search, 
      tipo, 
      prioridad, 
      totem_id, 
      activo,
      leida 
    } = req.query;
    
    const offset = (page - 1) * limit;
    const whereClause = {};
    
    if (search) {
      whereClause[db.Sequelize.Op.or] = [
        { titulo: { [db.Sequelize.Op.like]: `%${search}%` } },
        { mensaje: { [db.Sequelize.Op.like]: `%${search}%` } }
      ];
    }
    
    if (tipo) {
      whereClause.tipo = tipo;
    }
    
    if (prioridad) {
      whereClause.prioridad = prioridad;
    }
    
    if (totem_id) {
      whereClause.totem_id = totem_id;
    }
    
    if (activo !== undefined) {
      whereClause.activo = activo === 'true';
    }
    
    if (leida !== undefined) {
      whereClause.leida = leida === 'true';
    }

    const { count, rows } = await Notificacion.findAndCountAll({
      where: whereClause,
      include: [{
        model: Totem,
        as: 'totem',
        attributes: ['id', 'nombre_to', 'ubicacion']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['fecha_inicio', 'DESC']]
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getNotificacionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const notificacion = await Notificacion.findByPk(id, {
      include: [{
        model: Totem,
        as: 'totem',
        attributes: ['id', 'nombre_to', 'ubicacion', 'color']
      }]
    });

    if (!notificacion) {
      throw createError('Notificación no encontrada', HTTP_STATUS.NOT_FOUND, 'NOTIFICACION_NOT_FOUND');
    }

    res.json({
      success: true,
      data: notificacion
    });
  } catch (error) {
    next(error);
  }
};

export const createNotificacion = async (req, res, next) => {
  try {
    const {
      titulo,
      mensaje,
      tipo = 'info',
      prioridad = 'media',
      totem_id,
      fecha_inicio,
      fecha_fin,
      activo = true
    } = req.body;

    // Verificar que el tipo es válido
    if (!Object.values(TIPOS_NOTIFICACION).includes(tipo)) {
      throw createError('Tipo de notificación inválido', HTTP_STATUS.BAD_REQUEST, 'INVALID_NOTIFICATION_TYPE');
    }

    // Verificar que la prioridad es válida
    if (!Object.values(PRIORIDADES_NOTIFICACION).includes(prioridad)) {
      throw createError('Prioridad de notificación inválida', HTTP_STATUS.BAD_REQUEST, 'INVALID_NOTIFICATION_PRIORITY');
    }

    // Verificar que el TOTEM existe si se proporciona
    if (totem_id) {
      const totem = await Totem.findByPk(totem_id);
      if (!totem) {
        throw createError('TOTEM no encontrado', HTTP_STATUS.BAD_REQUEST, 'TOTEM_NOT_FOUND');
      }
    }

    // Validar fechas
    const fechaInicio = new Date(fecha_inicio);
    const fechaFin = fecha_fin ? new Date(fecha_fin) : null;

    if (fechaFin && fechaFin <= fechaInicio) {
      throw createError('La fecha de fin debe ser posterior a la fecha de inicio', HTTP_STATUS.BAD_REQUEST, 'INVALID_DATE_RANGE');
    }

    const notificacion = await Notificacion.create({
      titulo,
      mensaje,
      tipo,
      prioridad,
      totem_id,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      activo
    });

    // Obtener la notificación creada con el TOTEM
    const createdNotificacion = await Notificacion.findByPk(notificacion.id, {
      include: [{
        model: Totem,
        as: 'totem',
        attributes: ['id', 'nombre_to', 'ubicacion']
      }]
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Notificación creada exitosamente',
      data: createdNotificacion
    });
  } catch (error) {
    next(error);
  }
};

export const updateNotificacion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const notificacion = await Notificacion.findByPk(id);
    if (!notificacion) {
      throw createError('Notificación no encontrada', HTTP_STATUS.NOT_FOUND, 'NOTIFICACION_NOT_FOUND');
    }

    // Verificar que el tipo es válido si se proporciona
    if (updateData.tipo && !Object.values(TIPOS_NOTIFICACION).includes(updateData.tipo)) {
      throw createError('Tipo de notificación inválido', HTTP_STATUS.BAD_REQUEST, 'INVALID_NOTIFICATION_TYPE');
    }

    // Verificar que la prioridad es válida si se proporciona
    if (updateData.prioridad && !Object.values(PRIORIDADES_NOTIFICACION).includes(updateData.prioridad)) {
      throw createError('Prioridad de notificación inválida', HTTP_STATUS.BAD_REQUEST, 'INVALID_NOTIFICATION_PRIORITY');
    }

    // Verificar que el TOTEM existe si se proporciona
    if (updateData.totem_id) {
      const totem = await Totem.findByPk(updateData.totem_id);
      if (!totem) {
        throw createError('TOTEM no encontrado', HTTP_STATUS.BAD_REQUEST, 'TOTEM_NOT_FOUND');
      }
    }

    // Validar fechas si se proporcionan
    if (updateData.fecha_inicio || updateData.fecha_fin) {
      const fechaInicio = updateData.fecha_inicio ? new Date(updateData.fecha_inicio) : notificacion.fecha_inicio;
      const fechaFin = updateData.fecha_fin ? new Date(updateData.fecha_fin) : notificacion.fecha_fin;

      if (fechaFin && fechaFin <= fechaInicio) {
        throw createError('La fecha de fin debe ser posterior a la fecha de inicio', HTTP_STATUS.BAD_REQUEST, 'INVALID_DATE_RANGE');
      }
    }

    await notificacion.update(updateData);

    // Obtener la notificación actualizada con el TOTEM
    const updatedNotificacion = await Notificacion.findByPk(id, {
      include: [{
        model: Totem,
        as: 'totem',
        attributes: ['id', 'nombre_to', 'ubicacion']
      }]
    });

    res.json({
      success: true,
      message: 'Notificación actualizada exitosamente',
      data: updatedNotificacion
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotificacion = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notificacion = await Notificacion.findByPk(id);
    if (!notificacion) {
      throw createError('Notificación no encontrada', HTTP_STATUS.NOT_FOUND, 'NOTIFICACION_NOT_FOUND');
    }

    await notificacion.destroy();

    res.json({
      success: true,
      message: 'Notificación eliminada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

export const toggleNotificacionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notificacion = await Notificacion.findByPk(id);
    if (!notificacion) {
      throw createError('Notificación no encontrada', HTTP_STATUS.NOT_FOUND, 'NOTIFICACION_NOT_FOUND');
    }

    await notificacion.update({ activo: !notificacion.activo });

    res.json({
      success: true,
      message: `Notificación ${notificacion.activo ? 'desactivada' : 'activada'} exitosamente`,
      data: {
        id: notificacion.id,
        titulo: notificacion.titulo,
        activo: notificacion.activo
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getNotificacionesActivas = async (req, res, next) => {
  try {
    const { totem_id } = req.query;
    const whereClause = {
      activo: true,
      fecha_inicio: { [db.Sequelize.Op.lte]: new Date() }
    };

    if (totem_id) {
      whereClause.totem_id = totem_id;
    }

    // Agregar condición para fecha_fin si existe
    whereClause[db.Sequelize.Op.or] = [
      { fecha_fin: null },
      { fecha_fin: { [db.Sequelize.Op.gte]: new Date() } }
    ];

    const notificaciones = await Notificacion.findAll({
      where: whereClause,
      include: [{
        model: Totem,
        as: 'totem',
        attributes: ['id', 'nombre_to', 'ubicacion', 'color']
      }],
      order: [['prioridad', 'DESC'], ['fecha_inicio', 'DESC']]
    });

    res.json({
      success: true,
      data: notificaciones
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificacionAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notificacion = await Notificacion.findByPk(id);
    if (!notificacion) {
      throw createError('Notificación no encontrada', HTTP_STATUS.NOT_FOUND, 'NOTIFICACION_NOT_FOUND');
    }

    await notificacion.update({ leida: true });

    res.json({
      success: true,
      message: 'Notificación marcada como leída',
      data: {
        id: notificacion.id,
        titulo: notificacion.titulo,
        leida: true
      }
    });
  } catch (error) {
    next(error);
  }
};

