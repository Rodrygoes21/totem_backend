import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Multimedia = sequelize.define('Multimedia', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tipo_multimedia: {
    type: DataTypes.ENUM('imagen', 'video', 'audio', 'documento'),
    allowNull: false
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  titulo: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  totem_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'TOTEM',
      key: 'id'
    }
  },
  orden: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'Multimedia',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion'
});

export default Multimedia;

