const { sequelize, Sequelize } = require("../models/index");
const churchContent = require("../models/churchcontent");
const ChurchContent = churchContent(sequelize, Sequelize);
const Op = Sequelize.Op;
const createError = require("http-errors");
const db = require("../models");
const dateFns = require("date-fns");
const _ = require("lodash");
const debug = require("debug")("corner-stone:churchcontent");

const Controller = {};
module.exports = Controller;

Controller.searchChurchContent = async (req, res) => {
  debug(req.user);
  const { churchId } = req.user;
  const { query } = req.query;

  const content = await ChurchContent.findAll({
    where: { title: { [Op.like]: "%" + query + "%" }, churchId },
  });

  content.forEach((content) => {
    if (content.contentType === "sermon") {
      content.contentData = `${req.headers.host}/uploads/sermons/${content.contentData}`;
    }
  });

  //get the users church and search in that church
  //Query church content and return the results
  res.json({
    status: "00",
    data: content,
  }); ///data is array of search results
};

Controller.getChurchContentById = (req, res) => {
  //req.body = {searchText:"daily devotional"}
  //get the users church and search in that church
  //Query church content and return the results
  res.json({ status: "00", data: [{}] }); ///data is array of search results
};

Controller.getMyPlayList = (req, res) => {
  //return the user's playlist
  res.json({ status: "00", data: [{}] }); ///data is array of search results
};

Controller.addChurchContent = async (req, res, next) => {
  const { error } = ChurchContent.validateContent(req.body);
  if (error) return next(createError(400, error.details[0].message));

  const newContent = await ChurchContent.create(req.body);
  res.send(newContent);
};
