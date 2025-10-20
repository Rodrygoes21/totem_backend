import db from '../models/index.js';
import { createError } from '../middlewares/errorHandler.js';
import { HTTP_STATUS, PAGINATION_DEFAULTS, ESTADOS_CHAT } from '../utils/constants.js';

const { UserChat, Totem, Usuario } = db;

export const getAllUserChats = async (req, res, next) => {
  try {
    const { 
      page = PAGINATION_DEFAULTS.PAGE, 
      limit = PAGINATION_DEFAULTS.LIMIT, 
      search, 
      estado, 
      totem_id, 
      usuario_id 
    } = req.query;
    
    const offset = (page - 1) * limit;
    const whereClause = {};
    
    if (search) {
      whereClause[db.Sequelize.Op.or] = [
        { pregunta: { [db.Sequelize.Op.like]: `%${search}%` } },
        { respuesta: { [db.Sequelize.Op.like]: `%${search}%` } }
      ];
    }
    
    if (estado) {
      whereClause.estado = estado;
    }
    
    if (totem_id) {
      whereClause.totem_id = totem_id;
    }
    
    if (usuario_id) {
      whereClause.usuario_id = usuario_id;
    }

    const { count, rows } = await UserChat.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Totem,
          as: 'totem',
          attributes: ['id', 'nombre_to', 'ubicacion']
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'username', 'email'],
          required: false
        }
      ],
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

export const getUserChatById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const userChat = await UserChat.findByPk(id, {
      include: [
        {
          model: Totem,
          as: 'totem',
          attributes: ['id', 'nombre_to', 'ubicacion', 'color']
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'username', 'email'],
          required: false
        }
      ]
    });

    if (!userChat) {
      throw createError('Chat no encontrado', HTTP_STATUS.NOT_FOUND, 'CHAT_NOT_FOUND');
    }

    res.json({
      success: true,
      data: userChat
    });
  } catch (error) {
    next(error);
  }
};

export const createUserChat = async (req, res, next) => {
  try {
    const {
      totem_id,
      pregunta,
      usuario_id,
      ip_address,
      user_agent
    } = req.body;

    // Verificar que el TOTEM existe
    const totem = await Totem.findByPk(totem_id);
    if (!totem) {
      throw createError('TOTEM no encontrado', HTTP_STATUS.BAD_REQUEST, 'TOTEM_NOT_FOUND');
    }

    // Verificar que el TOTEM está activo
    if (!totem.activo) {
      throw createError('El TOTEM no está activo', HTTP_STATUS.BAD_REQUEST, 'TOTEM_INACTIVE');
    }

    // Verificar que el usuario existe si se proporciona
    if (usuario_id) {
      const usuario = await Usuario.findByPk(usuario_id);
      if (!usuario) {
        throw createError('Usuario no encontrado', HTTP_STATUS.BAD_REQUEST, 'USER_NOT_FOUND');
      }
    }

    const userChat = await UserChat.create({
      totem_id,
      pregunta,
      usuario_id,
      estado: 'pendiente',
      ip_address: ip_address || req.ip,
      user_agent: user_agent || req.get('User-Agent')
    });

    // Obtener el chat creado con las relaciones
    const createdChat = await UserChat.findByPk(userChat.id, {
      include: [
        {
          model: Totem,
          as: 'totem',
          attributes: ['id', 'nombre_to', 'ubicacion']
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'username', 'email'],
          required: false
        }
      ]
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Pregunta enviada exitosamente',
      data: createdChat
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserChat = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { respuesta, estado } = req.body;

    const userChat = await UserChat.findByPk(id);
    if (!userChat) {
      throw createError('Chat no encontrado', HTTP_STATUS.NOT_FOUND, 'CHAT_NOT_FOUND');
    }

    // Solo permitir actualizar si el chat está pendiente
    if (userChat.estado !== 'pendiente') {
      throw createError('Solo se pueden actualizar chats pendientes', HTTP_STATUS.BAD_REQUEST, 'CHAT_NOT_PENDING');
    }

    const updateData = {};
    
    if (respuesta) {
      updateData.respuesta = respuesta;
      updateData.fecha_respuesta = new Date();
      updateData.estado = estado || 'respondida';
    }
    
    if (estado && !respuesta) {
      updateData.estado = estado;
    }

    await userChat.update(updateData);

    // Obtener el chat actualizado con las relaciones
    const updatedChat = await UserChat.findByPk(id, {
      include: [
        {
          model: Totem,
          as: 'totem',
          attributes: ['id', 'nombre_to', 'ubicacion']
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'username', 'email'],
          required: false
        }
      ]
    });

    res.json({
      success: true,
      message: 'Chat actualizado exitosamente',
      data: updatedChat
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUserChat = async (req, res, next) => {
  try {
    const { id } = req.params;

    const userChat = await UserChat.findByPk(id);
    if (!userChat) {
      throw createError('Chat no encontrado', HTTP_STATUS.NOT_FOUND, 'CHAT_NOT_FOUND');
    }

    await userChat.destroy();

    res.json({
      success: true,
      message: 'Chat eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

export const closeUserChat = async (req, res, next) => {
  try {
    const { id } = req.params;

    const userChat = await UserChat.findByPk(id);
    if (!userChat) {
      throw createError('Chat no encontrado', HTTP_STATUS.NOT_FOUND, 'CHAT_NOT_FOUND');
    }

    if (userChat.estado === 'cerrada') {
      throw createError('El chat ya está cerrado', HTTP_STATUS.BAD_REQUEST, 'CHAT_ALREADY_CLOSED');
    }

    await userChat.update({ estado: 'cerrada' });

    res.json({
      success: true,
      message: 'Chat cerrado exitosamente',
      data: {
        id: userChat.id,
        estado: 'cerrada'
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getChatsPendientes = async (req, res, next) => {
  try {
    const { page = PAGINATION_DEFAULTS.PAGE, limit = PAGINATION_DEFAULTS.LIMIT, totem_id } = req.query;
    
    const offset = (page - 1) * limit;
    const whereClause = { estado: 'pendiente' };
    
    if (totem_id) {
      whereClause.totem_id = totem_id;
    }

    const { count, rows } = await UserChat.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Totem,
          as: 'totem',
          attributes: ['id', 'nombre_to', 'ubicacion']
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'username', 'email'],
          required: false
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['fecha_pregunta', 'ASC']]
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

export const getChatsByTotem = async (req, res, next) => {
  try {
    const { totem_id } = req.params;
    const { estado, page = PAGINATION_DEFAULTS.PAGE, limit = PAGINATION_DEFAULTS.LIMIT } = req.query;
    
    const offset = (page - 1) * limit;
    const whereClause = { totem_id };
    
    if (estado) {
      whereClause.estado = estado;
    }

    const { count, rows } = await UserChat.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Totem,
          as: 'totem',
          attributes: ['id', 'nombre_to', 'ubicacion']
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'username', 'email'],
          required: false
        }
      ],
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

export const getChatStats = async (req, res, next) => {
  try {
    const stats = await UserChat.findAll({
      attributes: [
        'estado',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count']
      ],
      group: ['estado'],
      raw: true
    });

    const totalChats = await UserChat.count();
    const chatsPendientes = await UserChat.count({ where: { estado: 'pendiente' } });
    const chatsRespondidos = await UserChat.count({ where: { estado: 'respondida' } });
    const chatsCerrados = await UserChat.count({ where: { estado: 'cerrada' } });

    res.json({
      success: true,
      data: {
        total: totalChats,
        pendientes: chatsPendientes,
        respondidos: chatsRespondidos,
        cerrados: chatsCerrados,
        stats: stats
      }
    });
  } catch (error) {
    next(error);
  }
};

