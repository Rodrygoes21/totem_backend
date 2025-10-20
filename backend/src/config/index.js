import sequelize from './database.js';

const config = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'password',
    database: process.env.DB_NAME || 'totem_db',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: console.log
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
  }
};

export default config;

