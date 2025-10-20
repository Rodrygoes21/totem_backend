import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Notificacion = sequelize.define('Notificacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titulo: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  mensaje: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('info', 'warning', 'error', 'success'),
    defaultValue: 'info'
  },
  prioridad: {
    type: DataTypes.ENUM('baja', 'media', 'alta', 'urgente'),
    defaultValue: 'media'
  },
  totem_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'TOTEM',
      key: 'id'
    }
  },
  fecha_inicio: {
    type: DataTypes.DATE,
    allowNull: false
  },
  fecha_fin: {
    type: DataTypes.DATE
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  leida: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'Notificacion',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion'
});

export default Notificacion;

