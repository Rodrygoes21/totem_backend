import sequelize from '../config/database.js';
import Region from './Region.js';
import Usuario from './Usuario.js';
import Institucion from './Institucion.js';
import Categoria from './Categoria.js';
import PlantillaColor from './PlantillaColor.js';
import Totem from './Totem.js';
import Multimedia from './Multimedia.js';
import Notificacion from './Notificacion.js';
import UserChat from './UserChat.js';
import LogActividad from './LogActividad.js';
import ConfiguracionSistema from './ConfiguracionSistema.js';

// Define associations
Usuario.belongsTo(Region, { foreignKey: 'region_id', as: 'region' });
Region.hasMany(Usuario, { foreignKey: 'region_id', as: 'usuarios' });

Totem.belongsTo(Institucion, { foreignKey: 'institucion_id', as: 'institucion' });
Institucion.hasMany(Totem, { foreignKey: 'institucion_id', as: 'totems' });

Totem.belongsTo(Categoria, { foreignKey: 'categoria_id', as: 'categoria' });
Categoria.hasMany(Totem, { foreignKey: 'categoria_id', as: 'totems' });

Totem.belongsTo(Region, { foreignKey: 'region_id', as: 'region' });
Region.hasMany(Totem, { foreignKey: 'region_id', as: 'totems' });

Totem.belongsTo(PlantillaColor, { foreignKey: 'plantilla_id', as: 'plantilla' });
PlantillaColor.hasMany(Totem, { foreignKey: 'plantilla_id', as: 'totems' });

Multimedia.belongsTo(Totem, { foreignKey: 'totem_id', as: 'totem' });
Totem.hasMany(Multimedia, { foreignKey: 'totem_id', as: 'multimedia' });

Notificacion.belongsTo(Totem, { foreignKey: 'totem_id', as: 'totem' });
Totem.hasMany(Notificacion, { foreignKey: 'totem_id', as: 'notificaciones' });

UserChat.belongsTo(Totem, { foreignKey: 'totem_id', as: 'totem' });
Totem.hasMany(UserChat, { foreignKey: 'totem_id', as: 'chats' });

UserChat.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
Usuario.hasMany(UserChat, { foreignKey: 'usuario_id', as: 'chats' });

LogActividad.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
Usuario.hasMany(LogActividad, { foreignKey: 'usuario_id', as: 'logs' });

const db = {
  sequelize,
  Sequelize: sequelize.Sequelize,
  Region,
  Usuario,
  Institucion,
  Categoria,
  PlantillaColor,
  Totem,
  Multimedia,
  Notificacion,
  UserChat,
  LogActividad,
  ConfiguracionSistema
};

export default db;

