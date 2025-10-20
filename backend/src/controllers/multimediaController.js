import db from '../models/index.js';
import { createError } from '../middlewares/errorHandler.js';
import { HTTP_STATUS, PAGINATION_DEFAULTS, TIPOS_MULTIMEDIA } from '../utils/constants.js';

const { Multimedia, Totem } = db;

export const getAllMultimedia = async (req, res, next) => {
  try {
    const { 
      page = PAGINATION_DEFAULTS.PAGE, 
      limit = PAGINATION_DEFAULTS.LIMIT, 
      search, 
      tipo_multimedia, 
      totem_id, 
      activo 
    } = req.query;
    
    const offset = (page - 1) * limit;
    const whereClause = {};
    
    if (search) {
      whereClause[db.Sequelize.Op.or] = [
        { titulo: { [db.Sequelize.Op.like]: `%${search}%` } },
        { descripcion: { [db.Sequelize.Op.like]: `%${search}%` } }
      ];
    }
    
    if (tipo_multimedia) {
      whereClause.tipo_multimedia = tipo_multimedia;
    }
    
    if (totem_id) {
      whereClause.totem_id = totem_id;
    }
    
    if (activo !== undefined) {
      whereClause.activo = activo === 'true';
    }

    const { count, rows } = await Multimedia.findAndCountAll({
      where: whereClause,
      include: [{
        model: Totem,
        as: 'totem',
        attributes: ['id', 'nombre_to', 'ubicacion']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['orden', 'ASC'], ['fecha_creacion', 'DESC']]
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

export const getMultimediaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const multimedia = await Multimedia.findByPk(id, {
      include: [{
        model: Totem,
        as: 'totem',
        attributes: ['id', 'nombre_to', 'ubicacion', 'color']
      }]
    });

    if (!multimedia) {
      throw createError('Multimedia no encontrada', HTTP_STATUS.NOT_FOUND, 'MULTIMEDIA_NOT_FOUND');
    }

    res.json({
      success: true,
      data: multimedia
    });
  } catch (error) {
    next(error);
  }
};

export const createMultimedia = async (req, res, next) => {
  try {
    const {
      tipo_multimedia,
      url,
      titulo,
      descripcion,
      totem_id,
      orden = 0,
      activo = true
    } = req.body;

    // Verificar que el tipo de multimedia es válido
    if (!Object.values(TIPOS_MULTIMEDIA).includes(tipo_multimedia)) {
      throw createError('Tipo de multimedia inválido', HTTP_STATUS.BAD_REQUEST, 'INVALID_MULTIMEDIA_TYPE');
    }

    // Verificar que el TOTEM existe si se proporciona
    if (totem_id) {
      const totem = await Totem.findByPk(totem_id);
      if (!totem) {
        throw createError('TOTEM no encontrado', HTTP_STATUS.BAD_REQUEST, 'TOTEM_NOT_FOUND');
      }
    }

    const multimedia = await Multimedia.create({
      tipo_multimedia,
      url,
      titulo,
      descripcion,
      totem_id,
      orden,
      activo
    });

    // Obtener la multimedia creada con el TOTEM
    const createdMultimedia = await Multimedia.findByPk(multimedia.id, {
      include: [{
        model: Totem,
        as: 'totem',
        attributes: ['id', 'nombre_to', 'ubicacion']
      }]
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Multimedia creada exitosamente',
      data: createdMultimedia
    });
  } catch (error) {
    next(error);
  }
};

export const updateMultimedia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const multimedia = await Multimedia.findByPk(id);
    if (!multimedia) {
      throw createError('Multimedia no encontrada', HTTP_STATUS.NOT_FOUND, 'MULTIMEDIA_NOT_FOUND');
    }

    // Verificar que el tipo de multimedia es válido si se proporciona
    if (updateData.tipo_multimedia && !Object.values(TIPOS_MULTIMEDIA).includes(updateData.tipo_multimedia)) {
      throw createError('Tipo de multimedia inválido', HTTP_STATUS.BAD_REQUEST, 'INVALID_MULTIMEDIA_TYPE');
    }

    // Verificar que el TOTEM existe si se proporciona
    if (updateData.totem_id) {
      const totem = await Totem.findByPk(updateData.totem_id);
      if (!totem) {
        throw createError('TOTEM no encontrado', HTTP_STATUS.BAD_REQUEST, 'TOTEM_NOT_FOUND');
      }
    }

    await multimedia.update(updateData);

    // Obtener la multimedia actualizada con el TOTEM
    const updatedMultimedia = await Multimedia.findByPk(id, {
      include: [{
        model: Totem,
        as: 'totem',
        attributes: ['id', 'nombre_to', 'ubicacion']
      }]
    });

    res.json({
      success: true,
      message: 'Multimedia actualizada exitosamente',
      data: updatedMultimedia
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMultimedia = async (req, res, next) => {
  try {
    const { id } = req.params;

    const multimedia = await Multimedia.findByPk(id);
    if (!multimedia) {
      throw createError('Multimedia no encontrada', HTTP_STATUS.NOT_FOUND, 'MULTIMEDIA_NOT_FOUND');
    }

    await multimedia.destroy();

    res.json({
      success: true,
      message: 'Multimedia eliminada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

export const toggleMultimediaStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const multimedia = await Multimedia.findByPk(id);
    if (!multimedia) {
      throw createError('Multimedia no encontrada', HTTP_STATUS.NOT_FOUND, 'MULTIMEDIA_NOT_FOUND');
    }

    await multimedia.update({ activo: !multimedia.activo });

    res.json({
      success: true,
      message: `Multimedia ${multimedia.activo ? 'desactivada' : 'activada'} exitosamente`,
      data: {
        id: multimedia.id,
        titulo: multimedia.titulo,
        activo: multimedia.activo
      }
    });
  } catch (error) {
    next(error);
  }
};

export const uploadMultimedia = async (req, res, next) => {
  try {
    // Simulación de upload - en producción usarías multer o similar
    const { url, tipo_multimedia, titulo, descripcion, totem_id } = req.body;

    if (!url || !tipo_multimedia || !titulo) {
      throw createError('URL, tipo y título son requeridos', HTTP_STATUS.BAD_REQUEST, 'MISSING_REQUIRED_FIELDS');
    }

    // Verificar que el tipo de multimedia es válido
    if (!Object.values(TIPOS_MULTIMEDIA).includes(tipo_multimedia)) {
      throw createError('Tipo de multimedia inválido', HTTP_STATUS.BAD_REQUEST, 'INVALID_MULTIMEDIA_TYPE');
    }

    // Verificar que el TOTEM existe si se proporciona
    if (totem_id) {
      const totem = await Totem.findByPk(totem_id);
      if (!totem) {
        throw createError('TOTEM no encontrado', HTTP_STATUS.BAD_REQUEST, 'TOTEM_NOT_FOUND');
      }
    }

    const multimedia = await Multimedia.create({
      tipo_multimedia,
      url,
      titulo,
      descripcion,
      totem_id,
      activo: true
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Archivo subido exitosamente',
      data: multimedia
    });
  } catch (error) {
    next(error);
  }
};

export const reorderMultimedia = async (req, res, next) => {
  try {
    const { multimediaItems } = req.body;

    if (!Array.isArray(multimediaItems)) {
      throw createError('multimediaItems debe ser un array', HTTP_STATUS.BAD_REQUEST, 'INVALID_ARRAY');
    }

    // Actualizar el orden de cada elemento
    for (const item of multimediaItems) {
      await Multimedia.update(
        { orden: item.orden },
        { where: { id: item.id } }
      );
    }

    res.json({
      success: true,
      message: 'Orden de multimedia actualizado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

