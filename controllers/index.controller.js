const { sequelize, Sequelize } = require("../models/index");
const church = require("../models/church");
const Church = church(sequelize, Sequelize);
const user = require("../models/user");
const User = user(sequelize, Sequelize);
const Op = Sequelize.Op;
const debug = require("debug")("corner-stone:index-controller");

const Controller = {};
module.exports = Controller;

Controller.index = async (req, res) => {
  const churchesCount = await Church.count();
  const usersCount = await User.count();
  res.render("index", {
    title: "Express",
    data: { churchesCount, usersCount },
  });
};

Controller.login = (req, res) => {
  res.render("index", { title: "Express" });
};

module.exports = Controller;
