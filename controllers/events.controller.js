const { sequelize, Sequelize } = require("../models/index");
const events = require("../models/events");
const Events = events(sequelize, Sequelize);
const db = require("../models");
const dateFns = require("date-fns");
const _ = require("lodash");
const multer = require("multer");
const Op = Sequelize.Op;
const debug = require("debug")("corner-stone:events-controller");
//utils
const { allowImagesOnly, storage } = require("../utils/upload");
const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: allowImagesOnly,
}).single("event-image");

const Controller = {};
module.exports = Controller;

Controller.getUpcomingEvents = async (req, res) => {
  const { churchId } = req.user;

  const events = await Events.findAll({
    where: { churchId, eventDate: { [Op.gte]: new Date() } },
    order: [["createdAt", "DESC"]],
  });

  events.forEach(
    (event) =>
      (event.imageBanner = `${req.headers.host}/uploads/${event.imageBanner}`)
  );

  res.json({ status: "00", data: events }); ///data is array of events
};

Controller.getUpcomingEventsView = async (req, res) => {
  const { churchId } = req.user;

  const events = await Events.findAll({
    where: {
      churchId,
      eventDate: { [Op.gte]: dateFns.format(new Date(), "yyyy-MM-dd") },
    },
    order: [["createdAt", "DESC"]],
  });

  res.render("events/events", { title: "Events", events, user: req.user }); ///data is array of events
};
Controller.addEventView = async (req, res) => {
  res.render("events/add-event", { title: "Add Event", user: req.user });
};

Controller.editEventView = async (req, res) => {
  const { id } = req.params;
  const { churchId } = req.user;

  const event = await Events.findOne({ where: { id, churchId } });

  if (!event) {
    req.flash("error", "Event not found!");
    return res.redirect("/events/edit");
  }

  res.render("events/edit-event", {
    title: "Edit Events",
    user: req.user,
    values: event,
    id,
  });
};

Controller.addEvent = async (req, res) => {
  const page = "events/add-event";
  const { churchId } = req.user;

  await upload(req, res, async (err) => {
    const { title, eventDate, eventTime } = req.body;
    if (err) {
      req.flash("error", err);
      return res.render(page, {
        title: "Add Event",
        values: req.body,
        user: req.user,
      });
    }
    const { error } = Events.validateEvent({ ...req.body, churchId });
    if (error) {
      req.flash("error", error.details[0].message);
      return res.render(page, {
        title: "Add Event",
        values: req.body,
        user: req.user,
      });
    }

    const eventExists = await Events.findOne({
      where: { title, eventDate, eventTime, churchId },
    });
    if (eventExists) {
      req.flash("error", "Event already exist");
      return res.render(page, {
        title: "Add Event",
        values: req.body,
        user: req.user,
      });
    }

    await Events.create({
      ...req.body,
      imageBanner: req.file.filename,
      churchId,
    });
    req.flash("success", "Event added successfully");
    return res.render(page, { title: "Events", user: req.user });
  });
};

Controller.editEvent = async (req, res) => {
  const { churchId } = req.user;
  const { title, eventDate, eventTime } = req.body;
  const { id } = req.params;

  const { error } = Events.validateEvent({ ...req.body, churchId });
  if (error) {
    req.flash("error", error.details[0].message);
    return res.render("events/edit-event", {
      title: "Edit Event",
      values: req.body,
      id,
    });
  }

  // return if event to edit not found
  const eventFound = await Events.findOne({ where: { id, churchId } });
  if (!eventFound) {
    req.flash("error", "Event not found!");
    return res.render("events/edit-event", {
      title: "Edit Event",
      values: req.body,
      id,
    });
  }

  //return if new values of event to edit already exist with another event
  const eventExists = await Events.findOne({
    where: { id: { [Op.ne]: id }, title, eventDate, eventTime, churchId },
  });

  if (eventExists) {
    req.flash("error", "Event already exist");
    return res.render("events/edit-event", {
      title: "Edit Event",
      values: req.body,
      id,
    });
  }

  await Events.update({ ...req.body }, { where: { churchId, id } });
  req.flash("success", "Event updated successfully");
  return res.redirect("/events");
};

Controller.editEventImage = async (req, res) => {
  const { churchId } = req.user;
  const { id } = req.params;
  const page = "events/edit-event";

  await upload(req, res, async (err) => {
    if (err) {
      req.flash("error", err);
      return res.render(page, {
        title: "Edit Event",
        values: req.body,
        user: req.user,
      });
    }
    const event = await Events.findOne({ where: { id, churchId } });
    if (!event) {
      req.flash("error", "Event not found");
      return res.render(page, {
        title: "Edit Event",
        values: req.body,
        user: req.user,
      });
    }
    event.imageBanner = req.file.filename;
    await event.save();

    req.flash("success", "Event image changed successfully");
    res.redirect("/events");
  });
};

Controller.deleteEvent = async (req, res) => {
  const { churchId } = req.user;
  const { id } = req.params;

  await Events.destroy({ where: { id, churchId } });

  res.redirect("/events");
};
