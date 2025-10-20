import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Categoria = sequelize.define('Categoria', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  informacion: {
    type: DataTypes.TEXT
  },
  icon: {
    type: DataTypes.STRING(100)
  },
  color: {
    type: DataTypes.STRING(7),
    defaultValue: '#3498db'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'Categoria',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion'
});

export default Categoria;

