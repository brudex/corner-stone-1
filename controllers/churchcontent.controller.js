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

Controller.sermonView = async (req, res) => {
  const sermons = await ChurchContent.findAll({
    where: { contentType: "sermon" },
    order: [["createdAt", "DESC"]],
  });
  res.render("sermons/sermons", {
    title: "Sermons",
    user: req.user,
    sermons,
  });
};
Controller.dailyDevotionalView = async (req, res) => {
  const { churchId } = req.user;
  const dailyDevotionals = await DailyDevotional.findAll({
    where: { churchId },
    order: [["createdAt", "DESC"]],
  });
  res.render("daily-devotionals/daily-devotional", {
    title: "Daily Devotionals",
    user: req.user,
    devotionals: dailyDevotionals,
  });
};

Controller.addDailyDevotionalView = async (req, res) => {
  res.render("daily-devotionals/add-daily-devotional", {
    title: "Add Devotionals",
    user: req.user,
  });
};

Controller.editDailyDevotionalView = async (req, res) => {
  const { id } = req.params;
  const { churchId } = req.user;
  const devotional = await DailyDevotional.findOne({ where: { churchId, id } });
  debug(devotional);
  res.render("daily-devotionals/edit-daily-devotional", {
    title: "Edit Daily Devotionals",
    user: req.user,
    id,
    values: devotional,
  });
};

Controller.addDailyDevotional = async (req, res) => {
  debug(req.body);
  let { isDefault, dateToShow } = req.body;
  const { churchId } = req.user;

  isDefault = isDefault === "on" ? true : false;

  const { error } = DailyDevotional.validateDevotional({
    ...req.body, //should contain devotionalContent, dateToShow, isDefault
    churchId,
    isDefault,
  });
  if (error) {
    req.flash("error", error.details[0].message);
    return res.render("daily-devotionals/add-daily-devotional", {
      title: "Add Devotionals",
      user: req.user,
      values: req.body,
    });
  }

  //if devotional is default, update previous default status to false
  if (isDefault) {
    await DailyDevotional.update(
      { isDefault: false },
      { where: { isDefault: true } }
    );
  }

  // delete any other devotional set for same date.
  await DailyDevotional.destroy({
    where: {
      dateToShow: dateFns.format(new Date(dateToShow), "yyyy-MM-dd"),
    },
  });

  await DailyDevotional.create({
    ...req.body,
    churchId,
    isDefault,
  });
  req.flash("success", "Daily Devotional added successfully");
  res.redirect("/daily-devotionals/add");
};

Controller.editDailyDevotional = async (req, res) => {
  debug(req.body);
  const { id } = req.params;
  const { churchId } = req.user;
  req.body.isDefault = req.body.isDefault === "on" ? true : false;
  const { error } = DailyDevotional.validateDevotional({
    ...req.body,
    churchId,
  });
  if (error) {
    req.flash("error", error.details[0].message);
    return res.redirect(`/daily-devotionals/edit/${id}`);
  }

  //if devotional is default, update previous default status to false
  if (req.body.isDefault) {
    await DailyDevotional.update(
      { isDefault: false },
      { where: { isDefault: true } }
    );
  }

  const devotional = await DailyDevotional.findOne({ churchId, id });

  for (const [key, value] of Object.entries(req.body)) {
    devotional[key] = value;
  }

  await devotional.save();

  req.flash("success", "Daily Devotional updated successfully");
  res.redirect("/daily-devotionals");
};
Controller.devotionalView = async (req, res) => {
  const { churchId } = req.user;
  const devotionals = await ChurchContent.findAll({
    where: { churchId, contentType: "devotional" },
    order: [["createdAt", "DESC"]],
  });
  res.render("devotionals/devotional", {
    title: "Devotionals",
    user: req.user,
    devotionals,
  });
};
Controller.addDevotionalView = async (req, res) => {
  res.render("devotionals/add-devotional", {
    title: "Add Devotionals",
    user: req.user,
  });
};

Controller.editDevotionalView = async (req, res) => {
  const { id } = req.params;
  const { churchId } = req.user;
  const devotional = await ChurchContent.findOne({ where: { churchId, id } });
  debug(devotional);
  res.render("devotionals/edit-devotional", {
    title: "Edit Devotionals",
    id,
    user: req.user,
    values: devotional,
  });
};

Controller.addDevotional = async (req, res) => {
  debug(req.body);
  const { churchId } = req.user;
  const { error } = ChurchContent.validateContent({
    ...req.body,
    churchId,
    contentType: "devotional",
  });
  if (error) {
    req.flash("error", error.details[0].message);
    return res.redirect("/devotionals/add");
  }
  await ChurchContent.create({
    ...req.body,
    churchId,
    contentType: "devotional",
  });
  req.flash("success", "Devotional added successfully");
  res.redirect("/devotionals/add");
};

Controller.editDevotional = async (req, res) => {
  debug(req.body);
  const { id } = req.params;
  const { churchId } = req.user;
  const { error } = ChurchContent.validateContent({
    ...req.body,
    churchId,
    contentType: "devotional",
  });
  if (error) {
    req.flash("error", error.details[0].message);
    return res.redirect(`/devotionals/edit/${id}`);
  }
  await ChurchContent.update(
    { contentData: req.body.contentData, title: req.body.title },
    { where: { churchId, id } }
  );

  req.flash("success", "Devotional updated successfully");
  res.redirect("/devotionals");
};

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
