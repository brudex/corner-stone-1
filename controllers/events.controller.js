const express = require("express");
const router = express.Router();
const db = require("../models");
const dateFns = require("date-fns");
const _ = require("lodash");

const Controller = {};
module.exports = Controller;

Controller.getUpcomingEvents = (req, res) => {
   //get the users church adn get upcoming events for that church

  res.json({status:"00", data :[]}); ///data is array of events
};

