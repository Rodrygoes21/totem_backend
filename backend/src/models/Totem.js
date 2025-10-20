import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Totem = sequelize.define('Totem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_to: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  ubicacion: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  color: {
    type: DataTypes.STRING(7),
    allowNull: false,
    defaultValue: '#3498db'
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  institucion_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Institucion',
      key: 'id'
    }
  },
  categoria_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Categoria',
      key: 'id'
    }
  },
  region_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Region',
      key: 'id'
    }
  },
  plantilla_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'PlantillaColor',
      key: 'id'
    }
  },
  login_sitio: {
    type: DataTypes.STRING(100)
  },
  password_sitio: {
    type: DataTypes.STRING(255)
  },
  chatpdf_url: {
    type: DataTypes.STRING(500)
  },
  contenido_texto: {
    type: DataTypes.TEXT
  },
  video_url: {
    type: DataTypes.STRING(500)
  },
  mostrar_chat: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  mostrar_notificaciones: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  intervalo_actualizacion: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
    validate: {
      min: 10,
      max: 300
    }
  }
}, {
  tableName: 'TOTEM',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion'
});

export default Totem;

