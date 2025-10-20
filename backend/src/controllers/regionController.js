import db from '../models/index.js';
import { createError } from '../middlewares/errorHandler.js';
import { HTTP_STATUS, PAGINATION_DEFAULTS } from '../utils/constants.js';

const { Region } = db;

export const getAllRegiones = async (req, res, next) => {
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

    const { count, rows } = await Region.findAndCountAll({
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

export const getRegionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const region = await Region.findByPk(id, {
      include: [{
        model: db.Usuario,
        as: 'usuarios',
        attributes: ['id', 'username', 'email', 'rol'],
        limit: 5
      }, {
        model: db.Totem,
        as: 'totems',
        attributes: ['id', 'nombre_to', 'ubicacion', 'activo'],
        limit: 5
      }]
    });

    if (!region) {
      throw createError('Región no encontrada', HTTP_STATUS.NOT_FOUND, 'REGION_NOT_FOUND');
    }

    res.json({
      success: true,
      data: region
    });
  } catch (error) {
    next(error);
  }
};

export const createRegion = async (req, res, next) => {
  try {
    const { nombre, descripcion, activo = true } = req.body;

    // Verificar si la región ya existe
    const existingRegion = await Region.findOne({ where: { nombre } });
    if (existingRegion) {
      throw createError('La región ya existe', HTTP_STATUS.CONFLICT, 'REGION_EXISTS');
    }

    const region = await Region.create({
      nombre,
      descripcion,
      activo
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Región creada exitosamente',
      data: region
    });
  } catch (error) {
    next(error);
  }
};

export const updateRegion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, activo } = req.body;

    const region = await Region.findByPk(id);
    if (!region) {
      throw createError('Región no encontrada', HTTP_STATUS.NOT_FOUND, 'REGION_NOT_FOUND');
    }

    // Verificar si el nombre ya existe en otra región
    if (nombre && nombre !== region.nombre) {
      const existingRegion = await Region.findOne({
        where: {
          nombre,
          id: { [db.Sequelize.Op.ne]: id }
        }
      });
      if (existingRegion) {
        throw createError('El nombre de región ya existe', HTTP_STATUS.CONFLICT, 'REGION_NAME_EXISTS');
      }
    }

    await region.update({
      nombre: nombre || region.nombre,
      descripcion: descripcion !== undefined ? descripcion : region.descripcion,
      activo: activo !== undefined ? activo : region.activo
    });

    res.json({
      success: true,
      message: 'Región actualizada exitosamente',
      data: region
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRegion = async (req, res, next) => {
  try {
    const { id } = req.params;

    const region = await Region.findByPk(id);
    if (!region) {
      throw createError('Región no encontrada', HTTP_STATUS.NOT_FOUND, 'REGION_NOT_FOUND');
    }

    // Verificar si hay usuarios o totems asociados
    const usuariosCount = await db.Usuario.count({ where: { region_id: id } });
    const totemsCount = await db.Totem.count({ where: { region_id: id } });

    if (usuariosCount > 0 || totemsCount > 0) {
      throw createError(
        'No se puede eliminar la región porque tiene usuarios o totems asociados',
        HTTP_STATUS.BAD_REQUEST,
        'REGION_HAS_ASSOCIATIONS'
      );
    }

    await region.destroy();

    res.json({
      success: true,
      message: 'Región eliminada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

export const toggleRegionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const region = await Region.findByPk(id);
    if (!region) {
      throw createError('Región no encontrada', HTTP_STATUS.NOT_FOUND, 'REGION_NOT_FOUND');
    }

    await region.update({ activo: !region.activo });

    res.json({
      success: true,
      message: `Región ${region.activo ? 'desactivada' : 'activada'} exitosamente`,
      data: {
        id: region.id,
        nombre: region.nombre,
        activo: region.activo
      }
    });
  } catch (error) {
    next(error);
  }
};

