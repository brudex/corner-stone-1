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
const { allowImagesOnly, storage } = require("../utils/image_upload");
const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: allowImagesOnly,
}).single("church-image");

const Controller = {};
module.exports = Controller;

Controller.getUpcomingEvents = async (req, res) => {
  const { churchId } = req.user;
  //get the users church adn get upcoming events for that church
  const events = await Events.findAll({
    where: { churchId, eventDate: { [Op.gte]: new Date() } },
  });

  events.forEach(
    (event) =>
      (event.imageBanner = `${req.headers.host}/uploads/${event.imageBanner}`)
  );

  res.json({ status: "00", data: events }); ///data is array of events
};

Controller.addEvent = async (req, res) => {
  //TODO - Get church id from session and insert into create
  const page = "events/add";
  await upload(req, res, async (err) => {
    const { title, eventDate, eventTime } = req.body;
    if (err) {
      req.flash("error", err);
      return res.render(page, { title: "Add Event", values: req.body });
    }
    const { error } = Events.validateEvent(req.body);
    if (error) {
      req.flash("error", error.details[0].message);
      return res.render(page, { title: "Add Event", values: req.body });
    }
    //todo - query with church id
    const eventExists = await Events.findOne({
      where: { title, eventDate, eventTime },
    });
    if (eventExists) {
      req.flash("error", "Event already exist");
      return res.render(page, { title: "Add Event", values: req.body });
    }
    //todo - add church id
    await Events.create({ ...req.body, image: req.file.filename });
    req.flash("success", "Event added successfully");
    return res.render(page, { title: "Events" });
  });

  await Events.create();
  res.send("ok");
};

Controller.editEvent = async (req, res) => {
  //TODO - Get church id from session and insert into create
  const { id } = req.params;
  const { error } = Events.validateEvent(req.body);
  if (error) {
    req.flash("error", error.details[0].message);
    return res.render(page, { title: "Edit Event", values: req.body });
  }
  //todo - query with church id
  const eventExists = await Events.findOne({
    where: { id: { [Op.ne]: id }, title, eventDate, eventTime },
  });
  if (eventExists) {
    req.flash("error", "Event already exist");
    return res.render(page, { title: "Add Event", values: req.body });
  }
  await Events.create({ ...req.body, image: req.file.filename });
  req.flash("success", "Event added successfully");
  return res.render(page, { title: "Events" });
};
