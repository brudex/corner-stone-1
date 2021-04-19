const { sequelize, Sequelize } = require("../models/index");
const church = require("../models/Church");
const Church = church(sequelize, Sequelize);

const Controller = {};
module.exports = Controller;

Controller.getChurches = async (req, res, next) => {
  const churches = await Church.findAll();
  res.send(churches);
};
