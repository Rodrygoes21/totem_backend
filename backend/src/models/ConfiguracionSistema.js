import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ConfiguracionSistema = sequelize.define('ConfiguracionSistema', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  clave: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  valor: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
    defaultValue: 'string'
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  categoria: {
    type: DataTypes.STRING(50),
    defaultValue: 'general'
  },
  editable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'ConfiguracionSistema',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion'
});

export default ConfiguracionSistema;

