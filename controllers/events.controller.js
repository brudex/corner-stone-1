const { sequelize, Sequelize } = require("../models/index");
const events = require("../models/events");
const Events = events(sequelize, Sequelize);
const db = require("../models");
const dateFns = require("date-fns");
const _ = require("lodash");

const Controller = {};
module.exports = Controller;

Controller.getUpcomingEvents = async (req, res) => {
  const { churchId } = req.user;
  //get the users church adn get upcoming events for that church
  const events = await Events.findAll({ where: { churchId } });

  events.forEach(
    (event) =>
      (event.imageBanner = `${req.headers.host}/uploads/${event.imageBanner}`)
  );

  res.json({ status: "00", data: events }); ///data is array of events
};

Controller.addEvents = async (req, res) => {
  await Events.create({
    eventVenue: "Accra",
    imageBanner: "church-image-1618946666313.jpg",
    eventDate: "2021-04-27",
    eventTime: "09:30",
    churchId: 2,
    title: "Excursion to Mountains",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
  });
  res.send("ok");
};
