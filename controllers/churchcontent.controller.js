const { unlink } = require("fs");
const { sequelize, Sequelize } = require("../models/index");
const churchContent = require("../models/churchcontent");
const ChurchContent = churchContent(sequelize, Sequelize);
const dailyDevoptional = require("../models/dailydevotional");
const DailyDevotional = dailyDevoptional(sequelize, Sequelize);
const userPlayList = require("../models/user_playlist");
const UserPlayList = userPlayList(sequelize, Sequelize);
const featuredContent = require("../models/featuredcontent");
const FeaturedContent = featuredContent(sequelize, Sequelize);
const multer = require("multer");
const Op = Sequelize.Op;
const createError = require("http-errors");
const db = require("../models");
const dateFns = require("date-fns");
const _ = require("lodash");
const debug = require("debug")("corner-stone:churchcontent");
const cloudinary = require("cloudinary").v2;
//utils
const {
  allowAudiosOnly,
  storage,
  allowVidoesOnly,
} = require("../utils/upload");
const Joi = require("joi");
const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 100 },
  fileFilter: allowAudiosOnly,
}).single("sermon-audio");

cloudinary.config({
  cloud_name: "perple",
  api_key: "616251437221118",
  api_secret: "BjztMn3K0XgsrqtUxpEqqDlVjJo",
});

const uploadVideo = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 1024 },
  fileFilter: allowVidoesOnly,
}).single("video-file");

const Controller = {};
module.exports = Controller;

Controller.videosView = async (req, res) => {
  const { churchId } = req.user;
  const paginationResults = await ChurchContent.paginate(req, {
    contentType: "video",
    churchId,
  });

  const videos = paginationResults.data;

  res.render("videos/videos", {
    title: "Videos",
    user: req.user,
    videos,
    ...paginationResults,
  });
};
Controller.addVideoView = async (req, res) => {
  // let authorized = false;
  // const code = req.query.code;
  // const CLIENT_ID = OAuth2Data.web.client_id;
  // const CLIENT_SECRET = OAuth2Data.web.client_secret;
  // const REDIRECT_URL = OAuth2Data.web.redirect_uris[0];

  // const oAuth2Client = new google.auth.OAuth2(
  //   CLIENT_ID,
  //   CLIENT_SECRET,
  //   REDIRECT_URL
  // );

  // const SCOPES =
  //   "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/userinfo.profile";

  res.render("videos/add-videos", {
    title: "Add Video",
    user: req.user,
  });
};

Controller.addVideo = async (req, res) => {
  const { churchId } = req.user;

  uploadVideo(req, res, async (err) => {
    const { title } = req.body;

    if (err) {
      debug(err);
      return res.status(400).send("An error occured");
    }

    const { error } = ChurchContent.validateVideoContent({
      title,
      churchId,
      contentType: "video",
    });
    if (error) return res.status(400).send(error.details[0].message);

    cloudinary.uploader.upload_large(
      req.file.path,
      {
        resource_type: "video",
        timeout: 600000,
      },
      async function (error, result) {
        unlink(req.file.path, (err) => {
          if (err) throw err;
          debug("successfully deleted file");
        });
        if (error) {
          debug(error);
          return res.status(400).send("An error occurred!");
        }
        debug(result);
        await ChurchContent.create({
          title,
          churchId,
          contentType: "video",
          contentData: result.secure_url,
        });

        res.send("Video uploaded successfully");
      }
    );
  });
};
Controller.sermonView = async (req, res) => {
  const { churchId } = req.user;
  const paginationResults = await ChurchContent.paginate(req, {
    contentType: "sermon",
    churchId,
  });

  const sermons = paginationResults.data;
  res.render("sermons/sermons", {
    title: "Sermons",
    user: req.user,
    sermons,
    ...paginationResults,
  });
};

Controller.addSermonView = async (req, res) => {
  res.render("sermons/add-sermon", { title: "Add Sermon", user: req.user });
};

Controller.addSermon = async (req, res) => {
  const { churchId } = req.user;
  await upload(req, res, async (err) => {
    const { title } = req.body;
    if (err) {
      return res.status(400).send(err);
    }

    const schema = Joi.object({
      title: Joi.string().min(1).max(256).required(),
    });
    const { error } = schema.validate({ title });
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    const sermonExists = await ChurchContent.findOne({
      where: { title, churchId, contentType: "sermon" },
    });
    if (sermonExists) {
      return res.status(400).send("Sermon already exist");
    }

    await ChurchContent.create({
      title,
      contentData: req.file.filename,
      contentType: "sermon",
      churchId,
    });

    res.send("Sermon added successfully");
  });
};

Controller.deleteSermon = async (req, res) => {
  const { churchId } = req.user;
  const { id } = req.params;

  await ChurchContent.destroy({ where: { churchId, id } });
  req.flash("Sermon deleted successfully");
  res.redirect("/sermons/sermons");
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
      { where: { isDefault: true, churchId } }
    );
  }

  const devotional = await DailyDevotional.findOne({ churchId, id });
  if (!devotional) {
    req.flash("error", "daily devotional not found!");
    return res.redirect(`/daily-devotionals/edit/${id}`);
  }

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

  const dailyDevotional = await ChurchContent.findOne({
    where: { id, churchId },
  });

  if (!dailyDevotional) {
    req.flash("error", "devotional not found!");
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

Controller.getRecentContent = async (req, res, next) => {
  const { churchId } = req.user;
  let { limit, contentType } = req.query;
  limit = parseInt(limit);

  let recentContent;

  if (contentType === "all") {
    recentContent = await ChurchContent.findAll({
      order: [["createdAt", "DESC"]],
      limit: limit || 20,
      where: { churchId },
    });
  } else {
    recentContent = await ChurchContent.findAll({
      order: [["createdAt", "DESC"]],
      limit: limit || 20,
      where: { contentType, churchId },
    });
  }

  res.json({ status_code: "00", data: recentContent });
};
