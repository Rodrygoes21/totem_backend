import db from '../models/index.js';
import { createError } from '../middlewares/errorHandler.js';
import { HTTP_STATUS, PAGINATION_DEFAULTS } from '../utils/constants.js';

const { Categoria } = db;

export const getAllCategorias = async (req, res, next) => {
  try {
    const { page = PAGINATION_DEFAULTS.PAGE, limit = PAGINATION_DEFAULTS.LIMIT, search, activo } = req.query;
    
    const offset = (page - 1) * limit;
    const whereClause = {};
    
    if (search) {
      whereClause[db.Sequelize.Op.or] = [
        { nombre: { [db.Sequelize.Op.like]: `%${search}%` } },
        { informacion: { [db.Sequelize.Op.like]: `%${search}%` } }
      ];
    }
    
    if (activo !== undefined) {
      whereClause.activo = activo === 'true';
    }

    const { count, rows } = await Categoria.findAndCountAll({
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

export const getCategoriaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const categoria = await Categoria.findByPk(id, {
      include: [{
        model: db.Totem,
        as: 'totems',
        attributes: ['id', 'nombre_to', 'ubicacion', 'activo'],
        limit: 10,
        order: [['nombre_to', 'ASC']]
      }]
    });

    if (!categoria) {
      throw createError('Categoría no encontrada', HTTP_STATUS.NOT_FOUND, 'CATEGORIA_NOT_FOUND');
    }

    res.json({
      success: true,
      data: categoria
    });
  } catch (error) {
    next(error);
  }
};

export const createCategoria = async (req, res, next) => {
  try {
    const { nombre, informacion, icon, color = '#3498db', activo = true } = req.body;

    // Verificar si la categoría ya existe
    const existingCategoria = await Categoria.findOne({ where: { nombre } });
    if (existingCategoria) {
      throw createError('La categoría ya existe', HTTP_STATUS.CONFLICT, 'CATEGORIA_EXISTS');
    }

    const categoria = await Categoria.create({
      nombre,
      informacion,
      icon,
      color,
      activo
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: categoria
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategoria = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, informacion, icon, color, activo } = req.body;

    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      throw createError('Categoría no encontrada', HTTP_STATUS.NOT_FOUND, 'CATEGORIA_NOT_FOUND');
    }

    // Verificar si el nombre ya existe en otra categoría
    if (nombre && nombre !== categoria.nombre) {
      const existingCategoria = await Categoria.findOne({
        where: {
          nombre,
          id: { [db.Sequelize.Op.ne]: id }
        }
      });
      if (existingCategoria) {
        throw createError('El nombre de categoría ya existe', HTTP_STATUS.CONFLICT, 'CATEGORIA_NAME_EXISTS');
      }
    }

    await categoria.update({
      nombre: nombre || categoria.nombre,
      informacion: informacion !== undefined ? informacion : categoria.informacion,
      icon: icon !== undefined ? icon : categoria.icon,
      color: color || categoria.color,
      activo: activo !== undefined ? activo : categoria.activo
    });

    res.json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      data: categoria
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategoria = async (req, res, next) => {
  try {
    const { id } = req.params;

    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      throw createError('Categoría no encontrada', HTTP_STATUS.NOT_FOUND, 'CATEGORIA_NOT_FOUND');
    }

    // Verificar si hay totems asociados
    const totemsCount = await db.Totem.count({ where: { categoria_id: id } });

    if (totemsCount > 0) {
      throw createError(
        'No se puede eliminar la categoría porque tiene totems asociados',
        HTTP_STATUS.BAD_REQUEST,
        'CATEGORIA_HAS_TOTEMS'
      );
    }

    await categoria.destroy();

    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

export const toggleCategoriaStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const categoria = await Categoria.findByPk(id);
    if (!categoria) {
      throw createError('Categoría no encontrada', HTTP_STATUS.NOT_FOUND, 'CATEGORIA_NOT_FOUND');
    }

    await categoria.update({ activo: !categoria.activo });

    res.json({
      success: true,
      message: `Categoría ${categoria.activo ? 'desactivada' : 'activada'} exitosamente`,
      data: {
        id: categoria.id,
        nombre: categoria.nombre,
        activo: categoria.activo
      }
    });
  } catch (error) {
    next(error);
  }
};

