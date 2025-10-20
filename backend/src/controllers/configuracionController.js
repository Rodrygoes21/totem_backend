import db from '../models/index.js';
import { createError } from '../middlewares/errorHandler.js';
import { HTTP_STATUS, PAGINATION_DEFAULTS } from '../utils/constants.js';

const { ConfiguracionSistema } = db;

export const getConfiguracion = async (req, res, next) => {
  try {
    const { categoria } = req.query;
    
    const whereClause = {};
    if (categoria) {
      whereClause.categoria = categoria;
    }

    const configuraciones = await ConfiguracionSistema.findAll({
      where: whereClause,
      order: [['categoria', 'ASC'], ['clave', 'ASC']]
    });

    // Convertir a objeto para facilitar el uso en frontend
    const configObject = {};
    configuraciones.forEach(config => {
      let value = config.valor;
      
      // Convertir según el tipo
      switch (config.tipo) {
        case 'number':
          value = parseFloat(value);
          break;
        case 'boolean':
          value = value === 'true';
          break;
        case 'json':
          try {
            value = JSON.parse(value);
          } catch (e) {
            value = value;
          }
          break;
        default:
          value = value;
      }
      
      configObject[config.clave] = value;
    });

    res.json({
      success: true,
      data: configObject,
      raw: configuraciones
    });
  } catch (error) {
    next(error);
  }
};

export const getConfiguracionByKey = async (req, res, next) => {
  try {
    const { clave } = req.params;
    
    const configuracion = await ConfiguracionSistema.findOne({
      where: { clave }
    });

    if (!configuracion) {
      throw createError('Configuración no encontrada', HTTP_STATUS.NOT_FOUND, 'CONFIG_NOT_FOUND');
    }

    let value = configuracion.valor;
    
    // Convertir según el tipo
    switch (configuracion.tipo) {
      case 'number':
        value = parseFloat(value);
        break;
      case 'boolean':
        value = value === 'true';
        break;
      case 'json':
        try {
          value = JSON.parse(value);
        } catch (e) {
          value = value;
        }
        break;
      default:
        value = value;
    }

    res.json({
      success: true,
      data: {
        clave: configuracion.clave,
        valor: value,
        tipo: configuracion.tipo,
        descripcion: configuracion.descripcion,
        categoria: configuracion.categoria,
        editable: configuracion.editable
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateConfiguracion = async (req, res, next) => {
  try {
    const { configuraciones } = req.body;

    if (!Array.isArray(configuraciones)) {
      throw createError('configuraciones debe ser un array', HTTP_STATUS.BAD_REQUEST, 'INVALID_ARRAY');
    }

    const updatedConfigs = [];

    for (const config of configuraciones) {
      const { clave, valor } = config;

      const configuracion = await ConfiguracionSistema.findOne({
        where: { clave }
      });

      if (!configuracion) {
        throw createError(`Configuración '${clave}' no encontrada`, HTTP_STATUS.NOT_FOUND, 'CONFIG_NOT_FOUND');
      }

      if (!configuracion.editable) {
        throw createError(`Configuración '${clave}' no es editable`, HTTP_STATUS.BAD_REQUEST, 'CONFIG_NOT_EDITABLE');
      }

      // Convertir valor a string según el tipo
      let stringValue;
      switch (configuracion.tipo) {
        case 'number':
          stringValue = String(valor);
          break;
        case 'boolean':
          stringValue = String(valor);
          break;
        case 'json':
          stringValue = JSON.stringify(valor);
          break;
        default:
          stringValue = String(valor);
      }

      await configuracion.update({ valor: stringValue });
      
      updatedConfigs.push({
        clave: configuracion.clave,
        valor: valor,
        tipo: configuracion.tipo
      });
    }

    res.json({
      success: true,
      message: 'Configuración actualizada exitosamente',
      data: updatedConfigs
    });
  } catch (error) {
    next(error);
  }
};

export const updateSingleConfiguracion = async (req, res, next) => {
  try {
    const { clave } = req.params;
    const { valor } = req.body;

    const configuracion = await ConfiguracionSistema.findOne({
      where: { clave }
    });

    if (!configuracion) {
      throw createError('Configuración no encontrada', HTTP_STATUS.NOT_FOUND, 'CONFIG_NOT_FOUND');
    }

    if (!configuracion.editable) {
      throw createError('Esta configuración no es editable', HTTP_STATUS.BAD_REQUEST, 'CONFIG_NOT_EDITABLE');
    }

    // Convertir valor a string según el tipo
    let stringValue;
    switch (configuracion.tipo) {
      case 'number':
        stringValue = String(valor);
        break;
      case 'boolean':
        stringValue = String(valor);
        break;
      case 'json':
        stringValue = JSON.stringify(valor);
        break;
      default:
        stringValue = String(valor);
    }

    await configuracion.update({ valor: stringValue });

    res.json({
      success: true,
      message: 'Configuración actualizada exitosamente',
      data: {
        clave: configuracion.clave,
        valor: valor,
        tipo: configuracion.tipo
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createConfiguracion = async (req, res, next) => {
  try {
    const {
      clave,
      valor,
      tipo = 'string',
      descripcion,
      categoria = 'general',
      editable = true
    } = req.body;

    // Verificar que la clave no existe
    const existingConfig = await ConfiguracionSistema.findOne({
      where: { clave }
    });

    if (existingConfig) {
      throw createError('La configuración ya existe', HTTP_STATUS.CONFLICT, 'CONFIG_EXISTS');
    }

    // Convertir valor a string según el tipo
    let stringValue;
    switch (tipo) {
      case 'number':
        stringValue = String(valor);
        break;
      case 'boolean':
        stringValue = String(valor);
        break;
      case 'json':
        stringValue = JSON.stringify(valor);
        break;
      default:
        stringValue = String(valor);
    }

    const configuracion = await ConfiguracionSistema.create({
      clave,
      valor: stringValue,
      tipo,
      descripcion,
      categoria,
      editable
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Configuración creada exitosamente',
      data: configuracion
    });
  } catch (error) {
    next(error);
  }
};

export const deleteConfiguracion = async (req, res, next) => {
  try {
    const { clave } = req.params;

    const configuracion = await ConfiguracionSistema.findOne({
      where: { clave }
    });

    if (!configuracion) {
      throw createError('Configuración no encontrada', HTTP_STATUS.NOT_FOUND, 'CONFIG_NOT_FOUND');
    }

    if (!configuracion.editable) {
      throw createError('Esta configuración no se puede eliminar', HTTP_STATUS.BAD_REQUEST, 'CONFIG_NOT_DELETABLE');
    }

    await configuracion.destroy();

    res.json({
      success: true,
      message: 'Configuración eliminada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

export const getConfiguracionCategorias = async (req, res, next) => {
  try {
    const categorias = await ConfiguracionSistema.findAll({
      attributes: [
        'categoria',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count']
      ],
      group: ['categoria'],
      order: [['categoria', 'ASC']],
      raw: true
    });

    res.json({
      success: true,
      data: categorias
    });
  } catch (error) {
    next(error);
  }
};

export const resetConfiguracion = async (req, res, next) => {
  try {
    const { clave } = req.params;

    const configuracion = await ConfiguracionSistema.findOne({
      where: { clave }
    });

    if (!configuracion) {
      throw createError('Configuración no encontrada', HTTP_STATUS.NOT_FOUND, 'CONFIG_NOT_FOUND');
    }

    // Valores por defecto según la clave
    const defaultValues = {
      'app_name': 'TOTEM System',
      'app_version': '1.0.0',
      'max_file_size': '10485760',
      'session_timeout': '3600',
      'enable_registration': 'true',
      'maintenance_mode': 'false'
    };

    const defaultValue = defaultValues[clave] || '';
    await configuracion.update({ valor: defaultValue });

    res.json({
      success: true,
      message: 'Configuración restablecida a valores por defecto',
      data: {
        clave: configuracion.clave,
        valor: defaultValue,
        tipo: configuracion.tipo
      }
    });
  } catch (error) {
    next(error);
  }
};

