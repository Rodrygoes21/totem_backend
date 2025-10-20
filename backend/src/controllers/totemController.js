import db from '../models/index.js';
import { createError } from '../middlewares/errorHandler.js';
import { HTTP_STATUS, PAGINATION_DEFAULTS } from '../utils/constants.js';

const { Totem, Institucion, Categoria, Region, PlantillaColor, Multimedia, Notificacion, UserChat } = db;

export const getAllTotems = async (req, res, next) => {
  try {
    const { 
      page = PAGINATION_DEFAULTS.PAGE, 
      limit = PAGINATION_DEFAULTS.LIMIT, 
      search, 
      activo, 
      region_id, 
      institucion_id, 
      categoria_id,
      plantilla_id 
    } = req.query;
    
    const offset = (page - 1) * limit;
    const whereClause = {};
    
    if (search) {
      whereClause[db.Sequelize.Op.or] = [
        { nombre_to: { [db.Sequelize.Op.like]: `%${search}%` } },
        { ubicacion: { [db.Sequelize.Op.like]: `%${search}%` } },
        { descripcion: { [db.Sequelize.Op.like]: `%${search}%` } }
      ];
    }
    
    if (activo !== undefined) {
      whereClause.activo = activo === 'true';
    }
    
    if (region_id) {
      whereClause.region_id = region_id;
    }
    
    if (institucion_id) {
      whereClause.institucion_id = institucion_id;
    }
    
    if (categoria_id) {
      whereClause.categoria_id = categoria_id;
    }
    
    if (plantilla_id) {
      whereClause.plantilla_id = plantilla_id;
    }

    const { count, rows } = await Totem.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Institucion,
          as: 'institucion',
          attributes: ['id', 'nombre']
        },
        {
          model: Categoria,
          as: 'categoria',
          attributes: ['id', 'nombre', 'color']
        },
        {
          model: Region,
          as: 'region',
          attributes: ['id', 'nombre']
        },
        {
          model: PlantillaColor,
          as: 'plantilla',
          attributes: ['id', 'nombre', 'color_principal']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['nombre_to', 'ASC']]
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

export const getTotemById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const totem = await Totem.findByPk(id, {
      include: [
        {
          model: Institucion,
          as: 'institucion',
          attributes: ['id', 'nombre', 'direccion', 'telefono']
        },
        {
          model: Categoria,
          as: 'categoria',
          attributes: ['id', 'nombre', 'informacion', 'icon', 'color']
        },
        {
          model: Region,
          as: 'region',
          attributes: ['id', 'nombre']
        },
        {
          model: PlantillaColor,
          as: 'plantilla',
          attributes: ['id', 'nombre', 'color_principal', 'color_secundario', 'color_fondo', 'color_texto']
        },
        {
          model: Multimedia,
          as: 'multimedia',
          where: { activo: true },
          required: false,
          order: [['orden', 'ASC']]
        },
        {
          model: Notificacion,
          as: 'notificaciones',
          where: { activo: true },
          required: false,
          order: [['fecha_inicio', 'DESC']]
        }
      ]
    });

    if (!totem) {
      throw createError('TOTEM no encontrado', HTTP_STATUS.NOT_FOUND, 'TOTEM_NOT_FOUND');
    }

    res.json({
      success: true,
      data: totem
    });
  } catch (error) {
    next(error);
  }
};

export const createTotem = async (req, res, next) => {
  try {
    const {
      nombre_to,
      ubicacion,
      color = '#3498db',
      descripcion,
      activo = true,
      institucion_id,
      categoria_id,
      region_id,
      plantilla_id,
      login_sitio,
      password_sitio,
      chatpdf_url,
      contenido_texto,
      video_url,
      mostrar_chat = true,
      mostrar_notificaciones = true,
      intervalo_actualizacion = 30
    } = req.body;

    // Verificar si el TOTEM ya existe
    const existingTotem = await Totem.findOne({ where: { nombre_to } });
    if (existingTotem) {
      throw createError('El TOTEM ya existe', HTTP_STATUS.CONFLICT, 'TOTEM_EXISTS');
    }

    // Verificar referencias si se proporcionan
    if (institucion_id) {
      const institucion = await Institucion.findByPk(institucion_id);
      if (!institucion) {
        throw createError('Institución no encontrada', HTTP_STATUS.BAD_REQUEST, 'INSTITUCION_NOT_FOUND');
      }
    }

    if (categoria_id) {
      const categoria = await Categoria.findByPk(categoria_id);
      if (!categoria) {
        throw createError('Categoría no encontrada', HTTP_STATUS.BAD_REQUEST, 'CATEGORIA_NOT_FOUND');
      }
    }

    if (region_id) {
      const region = await Region.findByPk(region_id);
      if (!region) {
        throw createError('Región no encontrada', HTTP_STATUS.BAD_REQUEST, 'REGION_NOT_FOUND');
      }
    }

    if (plantilla_id) {
      const plantilla = await PlantillaColor.findByPk(plantilla_id);
      if (!plantilla) {
        throw createError('Plantilla no encontrada', HTTP_STATUS.BAD_REQUEST, 'PLANTILLA_NOT_FOUND');
      }
    }

    const totem = await Totem.create({
      nombre_to,
      ubicacion,
      color,
      descripcion,
      activo,
      institucion_id,
      categoria_id,
      region_id,
      plantilla_id,
      login_sitio,
      password_sitio,
      chatpdf_url,
      contenido_texto,
      video_url,
      mostrar_chat,
      mostrar_notificaciones,
      intervalo_actualizacion
    });

    // Obtener el TOTEM creado con todas las relaciones
    const createdTotem = await Totem.findByPk(totem.id, {
      include: [
        {
          model: Institucion,
          as: 'institucion',
          attributes: ['id', 'nombre']
        },
        {
          model: Categoria,
          as: 'categoria',
          attributes: ['id', 'nombre', 'color']
        },
        {
          model: Region,
          as: 'region',
          attributes: ['id', 'nombre']
        },
        {
          model: PlantillaColor,
          as: 'plantilla',
          attributes: ['id', 'nombre', 'color_principal']
        }
      ]
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'TOTEM creado exitosamente',
      data: createdTotem
    });
  } catch (error) {
    next(error);
  }
};

export const updateTotem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const totem = await Totem.findByPk(id);
    if (!totem) {
      throw createError('TOTEM no encontrado', HTTP_STATUS.NOT_FOUND, 'TOTEM_NOT_FOUND');
    }

    // Verificar si el nombre ya existe en otro TOTEM
    if (updateData.nombre_to && updateData.nombre_to !== totem.nombre_to) {
      const existingTotem = await Totem.findOne({
        where: {
          nombre_to: updateData.nombre_to,
          id: { [db.Sequelize.Op.ne]: id }
        }
      });
      if (existingTotem) {
        throw createError('El nombre de TOTEM ya existe', HTTP_STATUS.CONFLICT, 'TOTEM_NAME_EXISTS');
      }
    }

    // Verificar referencias si se proporcionan
    if (updateData.institucion_id) {
      const institucion = await Institucion.findByPk(updateData.institucion_id);
      if (!institucion) {
        throw createError('Institución no encontrada', HTTP_STATUS.BAD_REQUEST, 'INSTITUCION_NOT_FOUND');
      }
    }

    if (updateData.categoria_id) {
      const categoria = await Categoria.findByPk(updateData.categoria_id);
      if (!categoria) {
        throw createError('Categoría no encontrada', HTTP_STATUS.BAD_REQUEST, 'CATEGORIA_NOT_FOUND');
      }
    }

    if (updateData.region_id) {
      const region = await Region.findByPk(updateData.region_id);
      if (!region) {
        throw createError('Región no encontrada', HTTP_STATUS.BAD_REQUEST, 'REGION_NOT_FOUND');
      }
    }

    if (updateData.plantilla_id) {
      const plantilla = await PlantillaColor.findByPk(updateData.plantilla_id);
      if (!plantilla) {
        throw createError('Plantilla no encontrada', HTTP_STATUS.BAD_REQUEST, 'PLANTILLA_NOT_FOUND');
      }
    }

    await totem.update(updateData);

    // Obtener el TOTEM actualizado con todas las relaciones
    const updatedTotem = await Totem.findByPk(id, {
      include: [
        {
          model: Institucion,
          as: 'institucion',
          attributes: ['id', 'nombre']
        },
        {
          model: Categoria,
          as: 'categoria',
          attributes: ['id', 'nombre', 'color']
        },
        {
          model: Region,
          as: 'region',
          attributes: ['id', 'nombre']
        },
        {
          model: PlantillaColor,
          as: 'plantilla',
          attributes: ['id', 'nombre', 'color_principal']
        }
      ]
    });

    res.json({
      success: true,
      message: 'TOTEM actualizado exitosamente',
      data: updatedTotem
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTotem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const totem = await Totem.findByPk(id);
    if (!totem) {
      throw createError('TOTEM no encontrado', HTTP_STATUS.NOT_FOUND, 'TOTEM_NOT_FOUND');
    }

    await totem.destroy();

    res.json({
      success: true,
      message: 'TOTEM eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

export const toggleTotemStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const totem = await Totem.findByPk(id);
    if (!totem) {
      throw createError('TOTEM no encontrado', HTTP_STATUS.NOT_FOUND, 'TOTEM_NOT_FOUND');
    }

    await totem.update({ activo: !totem.activo });

    res.json({
      success: true,
      message: `TOTEM ${totem.activo ? 'desactivado' : 'activado'} exitosamente`,
      data: {
        id: totem.id,
        nombre_to: totem.nombre_to,
        activo: totem.activo
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getTotemMultimedia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { activo = true } = req.query;

    const totem = await Totem.findByPk(id);
    if (!totem) {
      throw createError('TOTEM no encontrado', HTTP_STATUS.NOT_FOUND, 'TOTEM_NOT_FOUND');
    }

    const multimedia = await Multimedia.findAll({
      where: {
        totem_id: id,
        activo: activo === 'true'
      },
      order: [['orden', 'ASC'], ['fecha_creacion', 'ASC']]
    });

    res.json({
      success: true,
      data: multimedia
    });
  } catch (error) {
    next(error);
  }
};

export const getTotemNotificaciones = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { activo = true } = req.query;

    const totem = await Totem.findByPk(id);
    if (!totem) {
      throw createError('TOTEM no encontrado', HTTP_STATUS.NOT_FOUND, 'TOTEM_NOT_FOUND');
    }

    const notificaciones = await Notificacion.findAll({
      where: {
        totem_id: id,
        activo: activo === 'true'
      },
      order: [['fecha_inicio', 'DESC']]
    });

    res.json({
      success: true,
      data: notificaciones
    });
  } catch (error) {
    next(error);
  }
};

export const getTotemChats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado, page = PAGINATION_DEFAULTS.PAGE, limit = PAGINATION_DEFAULTS.LIMIT } = req.query;

    const totem = await Totem.findByPk(id);
    if (!totem) {
      throw createError('TOTEM no encontrado', HTTP_STATUS.NOT_FOUND, 'TOTEM_NOT_FOUND');
    }

    const offset = (page - 1) * limit;
    const whereClause = { totem_id: id };

    if (estado) {
      whereClause.estado = estado;
    }

    const { count, rows } = await UserChat.findAndCountAll({
      where: whereClause,
      include: [{
        model: db.Usuario,
        as: 'usuario',
        attributes: ['id', 'username', 'email'],
        required: false
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['fecha_pregunta', 'DESC']]
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

