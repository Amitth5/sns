
const databaseConfig = require("./dbConfig.js");

const Sequelize = require("sequelize");
const sequelizeInstance = new Sequelize(databaseConfig.DB, databaseConfig.USER, databaseConfig.PASSWORD, {
  host: databaseConfig.HOST,
  dialect: databaseConfig.dialect,
  operatorsAliases: false,

  pool: {
    max: databaseConfig.pool.max,
    min: databaseConfig.pool.min,
    acquire: databaseConfig.pool.acquire,
    idle: databaseConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelizeInstance;

db.sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });


module.exports = db;