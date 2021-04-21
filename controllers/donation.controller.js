const express = require("express");
const router = express.Router();
const db = require("../models");
const dateFns = require("date-fns");
const _ = require("lodash");

const Controller = {};
module.exports = Controller;

Controller.getChurchDonationTypes = (req, res) => {
   //get the user's church and get the donation types of the church

  res.json({status:"00", data :[]}); ///data is array of events
};

Controller.makeDonation = (req, res) => {
  //get the users church adn get upcoming events for that church

  res.json({status:"00", data :[]}); ///data is array of events
};

Controller.donationHistory = (req, res) => {
  //get the users donation history

  res.json({status:"00", data :[]}); ///data is array of events
};


