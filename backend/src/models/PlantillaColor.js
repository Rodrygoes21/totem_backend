import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PlantillaColor = sequelize.define('PlantillaColor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  color_principal: {
    type: DataTypes.STRING(7),
    allowNull: false,
    defaultValue: '#3498db'
  },
  color_secundario: {
    type: DataTypes.STRING(7),
    defaultValue: '#2c3e50'
  },
  color_fondo: {
    type: DataTypes.STRING(7),
    defaultValue: '#ffffff'
  },
  color_texto: {
    type: DataTypes.STRING(7),
    defaultValue: '#000000'
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'PlantillaColor',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion'
});

export default PlantillaColor;

