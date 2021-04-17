const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const debug = require("debug")("corner-stone:db_connection");
const db = {};

debug(process.env.DBNAME);

const sequelize = new Sequelize(
  process.env.DBNAME,
  process.env.DBUSER,
  process.env.DBPASS,
  {
    host: process.env.DBHOST,
    dialect: "mysql" /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    debug("Connection has been established successfully.");
    await sequelize.sync({ force: false });
  } catch (error) {
    debug("Unable to connect to the database:", error);
  }
})();

fs.readdirSync(__dirname)
  .filter((file) => file.indexOf(".") !== 0 && file !== "index.js")
  .forEach((file) => {
    const model = sequelize["import"](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
