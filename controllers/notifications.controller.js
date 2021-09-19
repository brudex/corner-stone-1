const { sequelize, Sequelize } = require("../models/index");
const notifications = require("../models/notifications");
const Notifications = notifications(sequelize, Sequelize);
const user = require("../models/user");
const User = user(sequelize, Sequelize);
const db = require("../models");
const dateFns = require("date-fns");
const _ = require("lodash");
const { default: fetch } = require("node-fetch");
const Op = Sequelize.Op;
const config = require("../config/config");
const debug = require("debug")("corner-stone:notifications-controller");
//utils
const Controller = {};
module.exports = Controller;

Controller.sendNotificationView = async (req, res) => {
  res.render("notifications/send-notification", {
    title: "Send Notification",
    user: req.user,
  });
};

Controller.sendNotifications = async (req, res) => {
  const { churchId } = req.user;
  const { title, body } = req.body;

  debug("church- admin");

  const users = await User.findAll({
    where: { churchId },
    attributes: ["fcm_token"],
  });

  const tokens = users.map((user) => user.fcm_token);
  debug(tokens);

  const notification = {
    title,
    body,
  };

  const notificationBody = {
    notification,
    registration_ids: tokens,
  };

  fetch("https://fcm.googleapis.com/fcm/send", {
    method: "post",
    headers: {
      Authorization: config.firebase_cloud_api_key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(notificationBody),
  })
    .then(async (response) => {
      await Notifications.create({ ...req.body, churchId });
      req.flash("success", "notifications sent");
      res.redirect("/notifications/send-notification");
    })
    .catch((err) => {
      req.flash("error", "something went wrong");
      res.redirect("/notification/send-notification");
      debug(err);
    });
};

Controller.superAdminSendNotifications = async (req, res) => {
  const { title, body } = req.body;

  const users = await User.findAll({ attributes: ["fcm_token"] });

  const tokens = users.map((user) => user.fcm_token);
  debug(tokens);

  const notification = {
    title,
    body,
  };

  const notificationBody = {
    notification,
    registration_ids: tokens,
  };

  fetch("https://fcm.googleapis.com/fcm/send", {
    method: "post",
    headers: {
      Authorization: config.firebase_cloud_api_key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(notificationBody),
  })
    .then(async (response) => {
      await Notifications.create(req.body);
      req.flash("success", "notifications sent");
      res.redirect("/notifications/send-notification");
    })
    .catch((err) => {
      req.flash("error", "something went wrong");
      res.redirect("/notifications/send-notification");
      debug(err);
    });
};

Controller.getChurchNotificationsHistory = async (req, res, next) => {
  const { churchId } = req.user;
  const paginationResults = await Notifications.paginate(req, { churchId });

  res.render("notifications/notifications", {
    title: "Notifications",
    user: req.user,
    ...paginationResults,
  });
};

Controller.getAllNotificationsHistory = async (req, res, next) => {
  const paginationResults = await Notifications.paginate(req, {
    churchId: null,
  });

  res.render("notifications/notifications", {
    title: "Notifications",
    user: req.user,
    ...paginationResults,
  });
};

Controller.getUserNotifications = async (req, res, next) => {
  const { churchId } = req.user;
  //const notifications = await Notifications.findAll({ where: { churchId } });
  const notifications =[];
  res.json({ status_code: "00", data: notifications });
};
