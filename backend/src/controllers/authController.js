import db from '../models/index.js';
import { hashPassword, comparePassword } from '../utils/hashPassword.js';
import { generateToken } from '../utils/generateToken.js';
import { createError } from '../middlewares/errorHandler.js';
import { HTTP_STATUS } from '../utils/constants.js';

const { Usuario } = db;

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const usuario = await Usuario.findOne({
      where: { email, activo: true },
      include: [{
        model: db.Region,
        as: 'region',
        attributes: ['id', 'nombre']
      }]
    });

    if (!usuario) {
      throw createError('Credenciales inválidas', HTTP_STATUS.UNAUTHORIZED, 'INVALID_CREDENTIALS');
    }

    // Verificar contraseña
    const isValidPassword = await comparePassword(password, usuario.contrasenia);
    if (!isValidPassword) {
      throw createError('Credenciales inválidas', HTTP_STATUS.UNAUTHORIZED, 'INVALID_CREDENTIALS');
    }

    // Actualizar último acceso
    await usuario.update({ ultimo_acceso: new Date() });

    // Generar token
    const token = generateToken({
      id: usuario.id,
      username: usuario.username,
      email: usuario.email,
      rol: usuario.rol,
      region_id: usuario.region_id
    });

    // Preparar respuesta del usuario (sin contraseña)
    const userResponse = {
      id: usuario.id,
      username: usuario.username,
      email: usuario.email,
      rol: usuario.rol,
      region_id: usuario.region_id,
      region: usuario.region,
      ultimo_acceso: usuario.ultimo_acceso
    };

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const { username, email, password, rol = 'usuario', region_id } = req.body;

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

    // Hash de la contraseña
    const hashedPassword = await hashPassword(password);

    // Crear usuario
    const usuario = await Usuario.create({
      username,
      email,
      contrasenia: hashedPassword,
      rol,
      region_id,
      activo: true
    });

    // Generar token
    const token = generateToken({
      id: usuario.id,
      username: usuario.username,
      email: usuario.email,
      rol: usuario.rol,
      region_id: usuario.region_id
    });

    // Preparar respuesta del usuario (sin contraseña)
    const userResponse = {
      id: usuario.id,
      username: usuario.username,
      email: usuario.email,
      rol: usuario.rol,
      region_id: usuario.region_id
    };

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Usuario creado exitosamente',
      token,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const usuario = await Usuario.findByPk(req.user.id, {
      include: [{
        model: db.Region,
        as: 'region',
        attributes: ['id', 'nombre']
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

export const updateProfile = async (req, res, next) => {
  try {
    const { username, email, region_id } = req.body;
    const userId = req.user.id;

    const usuario = await Usuario.findByPk(userId);
    if (!usuario) {
      throw createError('Usuario no encontrado', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
    }

    // Verificar si el email o username ya existen en otro usuario
    if (email && email !== usuario.email) {
      const existingUser = await Usuario.findOne({
        where: {
          email,
          id: { [db.Sequelize.Op.ne]: userId }
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
          id: { [db.Sequelize.Op.ne]: userId }
        }
      });
      if (existingUser) {
        throw createError('El username ya está en uso', HTTP_STATUS.CONFLICT, 'USERNAME_EXISTS');
      }
    }

    // Actualizar usuario
    await usuario.update({
      username: username || usuario.username,
      email: email || usuario.email,
      region_id: region_id !== undefined ? region_id : usuario.region_id
    });

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        id: usuario.id,
        username: usuario.username,
        email: usuario.email,
        rol: usuario.rol,
        region_id: usuario.region_id
      }
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const usuario = await Usuario.findByPk(userId);
    if (!usuario) {
      throw createError('Usuario no encontrado', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
    }

    // Verificar contraseña actual
    const isValidPassword = await comparePassword(currentPassword, usuario.contrasenia);
    if (!isValidPassword) {
      throw createError('Contraseña actual incorrecta', HTTP_STATUS.BAD_REQUEST, 'INVALID_CURRENT_PASSWORD');
    }

    // Hash de la nueva contraseña
    const hashedNewPassword = await hashPassword(newPassword);

    // Actualizar contraseña
    await usuario.update({ contrasenia: hashedNewPassword });

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

