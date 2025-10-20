import db from '../models/index.js';
import { createError } from '../middlewares/errorHandler.js';
import { HTTP_STATUS, PAGINATION_DEFAULTS } from '../utils/constants.js';

const { Institucion } = db;

export const getAllInstituciones = async (req, res, next) => {
  try {
    const { page = PAGINATION_DEFAULTS.PAGE, limit = PAGINATION_DEFAULTS.LIMIT, search, activo } = req.query;
    
    const offset = (page - 1) * limit;
    const whereClause = {};
    
    if (search) {
      whereClause[db.Sequelize.Op.or] = [
        { nombre: { [db.Sequelize.Op.like]: `%${search}%` } },
        { descripcion: { [db.Sequelize.Op.like]: `%${search}%` } },
        { direccion: { [db.Sequelize.Op.like]: `%${search}%` } }
      ];
    }
    
    if (activo !== undefined) {
      whereClause.activo = activo === 'true';
    }

    const { count, rows } = await Institucion.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['nombre', 'ASC']]
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

export const getInstitucionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const institucion = await Institucion.findByPk(id, {
      include: [{
        model: db.Totem,
        as: 'totems',
        attributes: ['id', 'nombre_to', 'ubicacion', 'activo'],
        limit: 10,
        order: [['nombre_to', 'ASC']]
      }]
    });

    if (!institucion) {
      throw createError('Institución no encontrada', HTTP_STATUS.NOT_FOUND, 'INSTITUCION_NOT_FOUND');
    }

    res.json({
      success: true,
      data: institucion
    });
  } catch (error) {
    next(error);
  }
};

export const createInstitucion = async (req, res, next) => {
  try {
    const { nombre, descripcion, direccion, telefono, email, activo = true } = req.body;

    // Verificar si la institución ya existe
    const existingInstitucion = await Institucion.findOne({ where: { nombre } });
    if (existingInstitucion) {
      throw createError('La institución ya existe', HTTP_STATUS.CONFLICT, 'INSTITUCION_EXISTS');
    }

    const institucion = await Institucion.create({
      nombre,
      descripcion,
      direccion,
      telefono,
      email,
      activo
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Institución creada exitosamente',
      data: institucion
    });
  } catch (error) {
    next(error);
  }
};

export const updateInstitucion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, direccion, telefono, email, activo } = req.body;

    const institucion = await Institucion.findByPk(id);
    if (!institucion) {
      throw createError('Institución no encontrada', HTTP_STATUS.NOT_FOUND, 'INSTITUCION_NOT_FOUND');
    }

    // Verificar si el nombre ya existe en otra institución
    if (nombre && nombre !== institucion.nombre) {
      const existingInstitucion = await Institucion.findOne({
        where: {
          nombre,
          id: { [db.Sequelize.Op.ne]: id }
        }
      });
      if (existingInstitucion) {
        throw createError('El nombre de institución ya existe', HTTP_STATUS.CONFLICT, 'INSTITUCION_NAME_EXISTS');
      }
    }

    await institucion.update({
      nombre: nombre || institucion.nombre,
      descripcion: descripcion !== undefined ? descripcion : institucion.descripcion,
      direccion: direccion !== undefined ? direccion : institucion.direccion,
      telefono: telefono !== undefined ? telefono : institucion.telefono,
      email: email !== undefined ? email : institucion.email,
      activo: activo !== undefined ? activo : institucion.activo
    });

    res.json({
      success: true,
      message: 'Institución actualizada exitosamente',
      data: institucion
    });
  } catch (error) {
    next(error);
  }
};

export const deleteInstitucion = async (req, res, next) => {
  try {
    const { id } = req.params;

    const institucion = await Institucion.findByPk(id);
    if (!institucion) {
      throw createError('Institución no encontrada', HTTP_STATUS.NOT_FOUND, 'INSTITUCION_NOT_FOUND');
    }

    // Verificar si hay totems asociados
    const totemsCount = await db.Totem.count({ where: { institucion_id: id } });

    if (totemsCount > 0) {
      throw createError(
        'No se puede eliminar la institución porque tiene totems asociados',
        HTTP_STATUS.BAD_REQUEST,
        'INSTITUCION_HAS_TOTEMS'
      );
    }

    await institucion.destroy();

    res.json({
      success: true,
      message: 'Institución eliminada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

export const toggleInstitucionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const institucion = await Institucion.findByPk(id);
    if (!institucion) {
      throw createError('Institución no encontrada', HTTP_STATUS.NOT_FOUND, 'INSTITUCION_NOT_FOUND');
    }

    await institucion.update({ activo: !institucion.activo });

    res.json({
      success: true,
      message: `Institución ${institucion.activo ? 'desactivada' : 'activada'} exitosamente`,
      data: {
        id: institucion.id,
        nombre: institucion.nombre,
        activo: institucion.activo
      }
    });
  } catch (error) {
    next(error);
  }
};

