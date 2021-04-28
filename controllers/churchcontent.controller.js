const { sequelize, Sequelize } = require("../models/index");
const churchContent = require("../models/churchcontent");
const ChurchContent = churchContent(sequelize, Sequelize);
const dailyDevoptional = require("../models/dailydevotional");
const DailyDevotional = dailyDevoptional(sequelize, Sequelize);
const userPlayList = require("../models/user_playlist");
const UserPlayList = userPlayList(sequelize, Sequelize);
const featuredContent = require("../models/featuredcontent");
const FeaturedContent = featuredContent(sequelize, Sequelize);
const Op = Sequelize.Op;
const createError = require("http-errors");
const db = require("../models");
const dateFns = require("date-fns");
const _ = require("lodash");
const debug = require("debug")("corner-stone:churchcontent");

const Controller = {};
module.exports = Controller;

Controller.getFeaturedContent = async (req, res, next) => {
  const { churchId } = req.user;
  const featuredContent = await FeaturedContent.findAll({
    where: { churchId },
  });

  const churchContentIds = featuredContent.map(
    (content) => content.churchContentId
  );
  const content = await ChurchContent.findAll({
    where: { id: { [Op.or]: churchContentIds } },
  });
  res.json({ status: "00", data: content });
};

Controller.searchChurchContent = async (req, res) => {
  debug(req.user);
  const { churchId } = req.user;
  const { query } = req.query;

  const content = await ChurchContent.findAll({
    where: { title: { [Op.like]: "%" + query + "%" }, churchId },
  });

  content.forEach((content) => {
    if (content.contentType === "sermon")
      ChurchContent.createSermonUrl(content, req);
  });

  //get the users church and search in that church
  //Query church content and return the results
  res.json({
    status: "00",
    data: content,
  }); ///data is array of search results
};

Controller.getChurchContentById = async (req, res) => {
  const { churchId } = req.user;
  const churchContent = await ChurchContent.findOne({
    where: { id: req.params.id, churchId },
  });
  ChurchContent.createSermonUrl(churchContent, req);
  res.json({ status: "00", data: churchContent });
};

Controller.getChurchContent = async (req, res, next) => {
  const { limit, offset } = req.query;
  const { churchId } = req.user;
  const { contentType } = req.params;

  const churchContents = await ChurchContent.findAll({
    where: { contentType, churchId },
    order: [["createdAt", "DESC"]],
    limit: parseInt(limit) || 10,
    offset: parseInt(offset),
  });

  churchContents.forEach((content) =>
    ChurchContent.createSermonUrl(content, req)
  );

  res.json({ status_code: "03", data: churchContents });
};

Controller.getDailyDevotionals = async (req, res) => {
  const { churchId } = req.user;
  let dailyDevotional = await DailyDevotional.findOne({
    where: {
      churchId,
      dateToShow: dateFns.format(new Date(), "yyyy-MM-dd"),
    },
  });
  if (!dailyDevotional)
    dailyDevotional = await DailyDevotional.findOne({
      where: {
        churchId,
        isDefault: true,
      },
    });
  res.json({ status: "00", data: dailyDevotional });
};

Controller.getUserPlayList = async (req, res, next) => {
  const { id: userId } = req.user;
  const playlist = await UserPlayList.findAll({ userId });

  res.json({ status_code: "00", data: playlist });
};

Controller.addToUserPlayList = async (req, res, next) => {
  const { id: userId } = req.user;
  const { churchContentId, title } = req.body;
  const { error } = UserPlayList.validateList(req.body);
  if (error) return next(createError(400, error.details[0].message));

  const churchContent = await ChurchContent.findOne({
    where: { id: churchContentId },
  });
  if (!churchContent)
    return next(
      createError(400, {
        status_code: "03",
        message: "add to user playlist failed",
        reason: "Church content not Found",
      })
    );
  if (churchContent.title !== title)
    return next(
      createError(400, {
        status_code: "03",
        message: "add to user playlist failed",
        reason: "Church content titles do not match",
      })
    );
  await UserPlayList.create({ ...req.body, userId });

  res.json({ status: "00", message: "playlist updated successfully" });
};

//Test controllers to be deleted
Controller.addChurchContent = async (req, res, next) => {
  const { error } = ChurchContent.validateContent(req.body);
  if (error) return next(createError(400, error.details[0].message));

  const newContent = await ChurchContent.create(req.body);
  res.send(newContent);
};

Controller.addDailyDevotional = async (req, res, next) => {
  const { error } = DailyDevotional.validateDevotional(req.body);
  if (error) return next(createError(400, error.details[0].message));

  const newDevotional = await DailyDevotional.create(req.body);
  res.send(newDevotional);
};
