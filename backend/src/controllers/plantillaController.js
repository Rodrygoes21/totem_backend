import db from '../models/index.js';
import { createError } from '../middlewares/errorHandler.js';
import { HTTP_STATUS, PAGINATION_DEFAULTS } from '../utils/constants.js';

const { PlantillaColor } = db;

export const getAllPlantillas = async (req, res, next) => {
  try {
    const { page = PAGINATION_DEFAULTS.PAGE, limit = PAGINATION_DEFAULTS.LIMIT, search, activo } = req.query;
    
    const offset = (page - 1) * limit;
    const whereClause = {};
    
    if (search) {
      whereClause[db.Sequelize.Op.or] = [
        { nombre: { [db.Sequelize.Op.like]: `%${search}%` } },
        { descripcion: { [db.Sequelize.Op.like]: `%${search}%` } }
      ];
    }
    
    if (activo !== undefined) {
      whereClause.activo = activo === 'true';
    }

    const { count, rows } = await PlantillaColor.findAndCountAll({
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

export const getPlantillaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const plantilla = await PlantillaColor.findByPk(id, {
      include: [{
        model: db.Totem,
        as: 'totems',
        attributes: ['id', 'nombre_to', 'ubicacion', 'activo'],
        limit: 10,
        order: [['nombre_to', 'ASC']]
      }]
    });

    if (!plantilla) {
      throw createError('Plantilla no encontrada', HTTP_STATUS.NOT_FOUND, 'PLANTILLA_NOT_FOUND');
    }

    res.json({
      success: true,
      data: plantilla
    });
  } catch (error) {
    next(error);
  }
};

export const createPlantilla = async (req, res, next) => {
  try {
    const { 
      nombre, 
      color_principal = '#3498db', 
      color_secundario = '#2c3e50', 
      color_fondo = '#ffffff', 
      color_texto = '#000000',
      descripcion, 
      activo = true 
    } = req.body;

    // Verificar si la plantilla ya existe
    const existingPlantilla = await PlantillaColor.findOne({ where: { nombre } });
    if (existingPlantilla) {
      throw createError('La plantilla ya existe', HTTP_STATUS.CONFLICT, 'PLANTILLA_EXISTS');
    }

    const plantilla = await PlantillaColor.create({
      nombre,
      color_principal,
      color_secundario,
      color_fondo,
      color_texto,
      descripcion,
      activo
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Plantilla creada exitosamente',
      data: plantilla
    });
  } catch (error) {
    next(error);
  }
};

export const updatePlantilla = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      nombre, 
      color_principal, 
      color_secundario, 
      color_fondo, 
      color_texto,
      descripcion, 
      activo 
    } = req.body;

    const plantilla = await PlantillaColor.findByPk(id);
    if (!plantilla) {
      throw createError('Plantilla no encontrada', HTTP_STATUS.NOT_FOUND, 'PLANTILLA_NOT_FOUND');
    }

    // Verificar si el nombre ya existe en otra plantilla
    if (nombre && nombre !== plantilla.nombre) {
      const existingPlantilla = await PlantillaColor.findOne({
        where: {
          nombre,
          id: { [db.Sequelize.Op.ne]: id }
        }
      });
      if (existingPlantilla) {
        throw createError('El nombre de plantilla ya existe', HTTP_STATUS.CONFLICT, 'PLANTILLA_NAME_EXISTS');
      }
    }

    await plantilla.update({
      nombre: nombre || plantilla.nombre,
      color_principal: color_principal || plantilla.color_principal,
      color_secundario: color_secundario || plantilla.color_secundario,
      color_fondo: color_fondo || plantilla.color_fondo,
      color_texto: color_texto || plantilla.color_texto,
      descripcion: descripcion !== undefined ? descripcion : plantilla.descripcion,
      activo: activo !== undefined ? activo : plantilla.activo
    });

    res.json({
      success: true,
      message: 'Plantilla actualizada exitosamente',
      data: plantilla
    });
  } catch (error) {
    next(error);
  }
};

export const deletePlantilla = async (req, res, next) => {
  try {
    const { id } = req.params;

    const plantilla = await PlantillaColor.findByPk(id);
    if (!plantilla) {
      throw createError('Plantilla no encontrada', HTTP_STATUS.NOT_FOUND, 'PLANTILLA_NOT_FOUND');
    }

    // Verificar si hay totems asociados
    const totemsCount = await db.Totem.count({ where: { plantilla_id: id } });

    if (totemsCount > 0) {
      throw createError(
        'No se puede eliminar la plantilla porque tiene totems asociados',
        HTTP_STATUS.BAD_REQUEST,
        'PLANTILLA_HAS_TOTEMS'
      );
    }

    await plantilla.destroy();

    res.json({
      success: true,
      message: 'Plantilla eliminada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

export const togglePlantillaStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const plantilla = await PlantillaColor.findByPk(id);
    if (!plantilla) {
      throw createError('Plantilla no encontrada', HTTP_STATUS.NOT_FOUND, 'PLANTILLA_NOT_FOUND');
    }

    await plantilla.update({ activo: !plantilla.activo });

    res.json({
      success: true,
      message: `Plantilla ${plantilla.activo ? 'desactivada' : 'activada'} exitosamente`,
      data: {
        id: plantilla.id,
        nombre: plantilla.nombre,
        activo: plantilla.activo
      }
    });
  } catch (error) {
    next(error);
  }
};

