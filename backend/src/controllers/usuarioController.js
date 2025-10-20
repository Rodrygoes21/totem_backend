import db from '../models/index.js';
import { hashPassword } from '../utils/hashPassword.js';
import { createError } from '../middlewares/errorHandler.js';
import { HTTP_STATUS, PAGINATION_DEFAULTS, ROLES } from '../utils/constants.js';

const { Usuario, Region } = db;

export const getAllUsuarios = async (req, res, next) => {
  try {
    const { page = PAGINATION_DEFAULTS.PAGE, limit = PAGINATION_DEFAULTS.LIMIT, search, rol, activo } = req.query;
    
    const offset = (page - 1) * limit;
    const whereClause = {};
    
    if (search) {
      whereClause[db.Sequelize.Op.or] = [
        { username: { [db.Sequelize.Op.like]: `%${search}%` } },
        { email: { [db.Sequelize.Op.like]: `%${search}%` } }
      ];
    }
    
    if (rol) {
      whereClause.rol = rol;
    }
    
    if (activo !== undefined) {
      whereClause.activo = activo === 'true';
    }

    const { count, rows } = await Usuario.findAndCountAll({
      where: whereClause,
      include: [{
        model: Region,
        as: 'region',
        attributes: ['id', 'nombre']
      }],
      attributes: { exclude: ['contrasenia'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['username', 'ASC']]
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

export const getUsuarioById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const usuario = await Usuario.findByPk(id, {
      include: [{
        model: Region,
        as: 'region',
        attributes: ['id', 'nombre']
      }, {
        model: db.UserChat,
        as: 'chats',
        attributes: ['id', 'pregunta', 'estado', 'fecha_pregunta'],
        limit: 10,
        order: [['fecha_pregunta', 'DESC']]
      }],
      attributes: { exclude: ['contrasenia'] }
    });

    if (!usuario) {
      throw createError('Usuario no encontrado', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
    }

    res.json({
      success: true,
      data: usuario
    });
  } catch (error) {
    next(error);
  }
};

export const createUsuario = async (req, res, next) => {
  try {
    const { username, email, password, rol = 'usuario', region_id, activo = true } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await Usuario.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      throw createError('El usuario ya existe', HTTP_STATUS.CONFLICT, 'USER_EXISTS');
    }

    // Verificar que la región existe si se proporciona
    if (region_id) {
      const region = await Region.findByPk(region_id);
      if (!region) {
        throw createError('Región no encontrada', HTTP_STATUS.BAD_REQUEST, 'REGION_NOT_FOUND');
      }
    }

    // Hash de la contraseña
    const hashedPassword = await hashPassword(password);

    const usuario = await Usuario.create({
      username,
      email,
      contrasenia: hashedPassword,
      rol,
      region_id,
      activo
    });

    // Obtener el usuario creado con la región
    const createdUser = await Usuario.findByPk(usuario.id, {
      include: [{
        model: Region,
        as: 'region',
        attributes: ['id', 'nombre']
      }],
      attributes: { exclude: ['contrasenia'] }
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: createdUser
    });
  } catch (error) {
    next(error);
  }
};

export const updateUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, email, rol, region_id, activo } = req.body;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      throw createError('Usuario no encontrado', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
    }

    // Verificar si el email o username ya existen en otro usuario
    if (email && email !== usuario.email) {
      const existingUser = await Usuario.findOne({
        where: {
          email,
          id: { [db.Sequelize.Op.ne]: id }
        }
      });
      if (existingUser) {
        throw createError('El email ya está en uso', HTTP_STATUS.CONFLICT, 'EMAIL_EXISTS');
      }
    }

    if (username && username !== usuario.username) {
      const existingUser = await Usuario.findOne({
        where: {
          username,
          id: { [db.Sequelize.Op.ne]: id }
        }
      });
      if (existingUser) {
        throw createError('El username ya está en uso', HTTP_STATUS.CONFLICT, 'USERNAME_EXISTS');
      }
    }

    // Verificar que la región existe si se proporciona
    if (region_id && region_id !== usuario.region_id) {
      const region = await Region.findByPk(region_id);
      if (!region) {
        throw createError('Región no encontrada', HTTP_STATUS.BAD_REQUEST, 'REGION_NOT_FOUND');
      }
    }

    await usuario.update({
      username: username || usuario.username,
      email: email || usuario.email,
      rol: rol || usuario.rol,
      region_id: region_id !== undefined ? region_id : usuario.region_id,
      activo: activo !== undefined ? activo : usuario.activo
    });

    // Obtener el usuario actualizado con la región
    const updatedUser = await Usuario.findByPk(id, {
      include: [{
        model: Region,
        as: 'region',
        attributes: ['id', 'nombre']
      }],
      attributes: { exclude: ['contrasenia'] }
    });

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      throw createError('Usuario no encontrado', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
    }

    // No permitir eliminar el propio usuario
    if (req.user.id === parseInt(id)) {
      throw createError('No puedes eliminar tu propia cuenta', HTTP_STATUS.BAD_REQUEST, 'CANNOT_DELETE_SELF');
    }

    await usuario.destroy();

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

export const changeUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;

    if (!Object.values(ROLES).includes(rol)) {
      throw createError('Rol inválido', HTTP_STATUS.BAD_REQUEST, 'INVALID_ROLE');
    }

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      throw createError('Usuario no encontrado', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
    }

    await usuario.update({ rol });

    res.json({
      success: true,
      message: 'Rol de usuario actualizado exitosamente',
      data: {
        id: usuario.id,
        username: usuario.username,
        rol: usuario.rol
      }
    });
  } catch (error) {
    next(error);
  }
};

export const toggleUsuarioStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      throw createError('Usuario no encontrado', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
    }

    // No permitir desactivar el propio usuario
    if (req.user.id === parseInt(id)) {
      throw createError('No puedes desactivar tu propia cuenta', HTTP_STATUS.BAD_REQUEST, 'CANNOT_DEACTIVATE_SELF');
    }

    await usuario.update({ activo: !usuario.activo });

    res.json({
      success: true,
      message: `Usuario ${usuario.activo ? 'desactivado' : 'activado'} exitosamente`,
      data: {
        id: usuario.id,
        username: usuario.username,
        activo: usuario.activo
      }
    });
  } catch (error) {
    next(error);
  }
};

