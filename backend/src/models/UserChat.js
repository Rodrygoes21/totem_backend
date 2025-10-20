import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UserChat = sequelize.define('UserChat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  totem_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'TOTEM',
      key: 'id'
    }
  },
  pregunta: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  respuesta: {
    type: DataTypes.TEXT
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Usuario',
      key: 'id'
    }
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'respondida', 'cerrada'),
    defaultValue: 'pendiente'
  },
  fecha_pregunta: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  fecha_respuesta: {
    type: DataTypes.DATE
  },
  ip_address: {
    type: DataTypes.STRING(45)
  },
  user_agent: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'UserChat',
  timestamps: false
});

export default UserChat;

