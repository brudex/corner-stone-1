const db = require('../models');
const DonationTypes = db.ChurchDonationType;
const dateFns = require("date-fns");
const _ = require("lodash");

const Controller = {};
module.exports = Controller;

Controller.getChurchDonationTypes = async (req, res) => {
  const { churchId } = req.user;
  //get the user's church and get the donation types of the church
  const donationTypes = await DonationTypes.findAll({ where: { churchId } });
  res.json({ status: "00", data: donationTypes }); ///data is array of events
};

Controller.makeDonation = (req, res) => {
  //get the users church adn get upcoming events for that church
  res.json({ status: "00", data: [] }); ///data is array of events
};

Controller.donationHistory = (req, res) => {
  //get the users donation history

  res.json({ status: "00", data: [] }); ///data is array of events
};

Controller.addDonationType = async (req, res) => {
  await DonationTypes.create({ churchId: "2", donationType: "Tithe" });
  res.send("ok");
};
