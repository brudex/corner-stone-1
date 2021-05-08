const db = require("../models");
const DonationTypes = db.ChurchDonationType;
const Donations = db.ChurchDonation;
const Users = db.User;
const dateFns = require("date-fns");
const _ = require("lodash");
const { Op, where } = require("sequelize");
const Joi = require("joi");

const Controller = {};
module.exports = Controller;

Controller.getDonationsView = async (req, res) => {
  const { user } = req;
  const { churchId } = req.user;
  const donations = await Donations.paginate(req, { churchId });

  //Get Users
  const userIds = donations.data.map((donation) => donation.userId);
  const users = await Users.findAll({
    where: { id: { [Op.in]: userIds } },
    attributes: ["id", "firstName", "lastName"],
  });

  //Get DonationType
  const donationTypes = await DonationTypes.findAll({
    where: { churchId },
    attributes: ["id", "donationType"],
  });

  //update donation data
  donations.data.forEach((donation) => {
    donation.userId = users.filter((user) => user.id === donation.userId)[0];
    donation.donationTypeId = donationTypes.filter(
      (donationType) => donationType.id === donation.donationTypeId
    )[0];
  });

  res.render("donations/donations", { title: "Donations", ...donations, user });
};

Controller.donationTypesView = async (req, res) => {
  const { user } = req;
  const { churchId } = req.user;
  const donationTypes = await DonationTypes.paginate(req, { churchId });
  res.render("donations/donation-types", {
    title: "Donation types",
    ...donationTypes,
    user,
  });
};

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
  const { user } = req;
  const { churchId } = user;
  const { donationType } = req.body;
  const schema = Joi.string().min(1).max(256).required();
  const { error } = schema.validate(donationType);

  if (error) {
    req.flash("error", error.details[0].message);
    return res.render("donations/donation-types", {
      title: "Donation types",
      user,
      values: req.body,
    });
  }

  await DonationTypes.create({ churchId, donationType });
  req.flash("success", "Donation type added sucessfully");
  res.redirect("/donations/types");
};

Controller.editDonationType = async (req, res) => {
  const { user } = req;
  const { churchId } = user;
  const { id } = req.params;
  const { donationType } = req.body;
  const schema = Joi.string().min(1).max(256).required();
  const { error } = schema.validate(donationType);

  if (error) {
    req.flash("error", error.details[0].message);
    return res.redirect("back");
  }
  //check if donation type with exact name already exist
  const donationTypeExist = await DonationTypes.findOne({
    where: { churchId, donationType, id: { [Op.ne]: id } },
  });
  if (donationTypeExist) {
    req.flash("error", "Donation name already exists");
    return res.redirect("back");
  }
  await DonationTypes.update({ donationType }, { where: { churchId, id } });
  req.flash("success", "Donation type added sucessfully");
  res.redirect("back");
};
