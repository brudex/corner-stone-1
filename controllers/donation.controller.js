const db = require("../models");
const DonationTypes = db.ChurchDonationType;
const Donations = db.ChurchDonation;
const Users = db.User;
const Church = db.Church;
const sequelize = require("sequelize");
const dateFns = require("date-fns");
const _ = require("lodash");
const { Op } = require("sequelize");
const Joi = require("joi");
const debug = require("debug")("corner-stone:donation-controller");

const Controller = {};
module.exports = Controller;

Controller.getDonationsByMonth = async (req, res) => {
  const { churchId, isSuperAdmin } = req.user;
  const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const monhtlyDonationData = [];
  let donationsByMonth;

  if (isSuperAdmin) {
    donationsByMonth = await Donations.findAll({
      attributes: [
        "createdAt",
        [sequelize.fn("sum", sequelize.col("amount")), "total_amount"],
      ],
      group: [sequelize.fn("month", sequelize.col("createdAt"))],
      raw: true,
    });
  } else {
    donationsByMonth = await Donations.findAll({
      attributes: [
        "createdAt",
        [sequelize.fn("sum", sequelize.col("amount")), "total_amount"],
      ],
      where: { churchId },
      group: [sequelize.fn("month", sequelize.col("createdAt"))],
      raw: true,
    });
  }

  const availableDonationMonths = donationsByMonth.map((donation) =>
    donation.createdAt.getMonth()
  );

  months.forEach((month) => {
    if (!availableDonationMonths.includes(month)) {
      monhtlyDonationData.push(0);
    } else {
      donationsByMonth.forEach((donation) => {
        if (donation.createdAt.getMonth() === month) {
          monhtlyDonationData.push(parseFloat(donation.total_amount));
        }
      });
    }
  });
  res.send(monhtlyDonationData);
};

Controller.getDonationsByChurchView = async (req, res) => {
  //Group donations by church
  //todo pass the date range
  let donationsByChurch = await Donations.findAll({
    attributes: [
      "churchId",
      [sequelize.fn("sum", sequelize.col("amount")), "total_amount"],
    ],
    group: ["churchId"],
  });

  donationsByChurch = JSON.parse(JSON.stringify(donationsByChurch));

  //Get churches
  const churchIds = donationsByChurch.map((donations) =>
    parseInt(donations.churchId)
  );
  console.log(churchIds);
  const churches = await Church.findAll({ where: { id: churchIds } });
  console.log(churches);

  //update donations
  donationsByChurch.forEach((donations) => {
    churches.forEach((church) => {
      if (church.id.toString() === donations.churchId.toString())
        donations.church = church.name;
    });
    donations.total_amount = parseInt(donations.total_amount).toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 2,
      }
    );
  });

  res.render("donations/donations-by-church", {
    title: "Donations",
    user: req.user,
    donations: donationsByChurch,
  });
};

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

Controller.donationHistory = (req, res) => {
  const array = [];
  const sql = `SELECT cd.paymentMode,cd.amount,cd.statusMessage,cd.pageId,cd.paymentReference,ct.donationType,cd.createdAt from churchdonation cd INNER JOIN churchdonationtype ct on cd.donationTypeId=ct.id where cd.userId=${req.user.id}`;
  db.sequelize
    .query(sql, { type: db.sequelize.QueryTypes.SELECT })
    .then(function (rows) {
      rows.forEach(function (row) {
        row.createdAt = dateFns.format(row.createdAt, "MMM dd, yyyy");
        array.push(row);
      });
      res.json({ status: "00", data: array });
    });
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

Controller.churchDonationsByDateRange = async (req, res) => {
  //todo Bright e.g. payload: {startDate : '2021-01-01',endDate: '2021-01-01',churchId:1}
  let startDate;
  let endDate;
  let churchId;
  let churches;

  //Set default dates
  if (!req.query.startDate && !req.query.endDate) {
    let today = new Date();
    let day = today.getDay() || 7; // Get current day number, converting Sun. to 7
    // Only manipulate the date if it isn't Mon.
    if (day !== 1) today.setHours(-24 * (day - 1)); // Set the hours to day number minus 1 multiplied by negative 24
    startDate = new Date(today).toISOString();
    endDate = new Date().toISOString();
  } else {
    startDate = new Date(req.query.startDate).toISOString();
    endDate = new Date(req.query.endDate).toISOString();
  }

  // if userType is church admin, grab churchId from session
  if (req.user.isAdmin) {
    churchId = req.user.churchId;
  } else {
    //else grab from req.query or set it if undefined
    churches = await Church.findAll({ raw: true });
    if (req.query.churchId) {
      churchId = req.query.churchId;
    } else {
      churchId = churches[0].id;
    }
  }
  let donationSum = 0;
  Donations.findAll({
    attributes: [
      "id",
      "amount",
      "paymentMode",
      "paymentStatus",
      "settlementStatus",
      "paymentReference",
      "createdAt",
    ],
    where: {
      churchId,
      createdAt: { [Op.between]: [startDate, endDate] },
      paymentStatus: "00",
    },
  }).then(function (donations) {
    donations.forEach(function (donation) {
      donationSum += parseFloat(donation.amount);
    });

    res.render("donations/church_donation_by_date", {
      title: "Donations by Data",
      donations,
      donationSum,
      churches,
      churchId,
      startDate,
      endDate,
      user: req.user,
    }); //todo : Bright render the page
  });
};

Controller.setSettlementStatus = async (req, res) => {
  if (!req.body.donationIds) {
    req.flash("error", `No data selected!`);
    return res.redirect("back"); //todo : Bright render the page
  }
  //todo Bright e.g. payload: {status : 'COMPLETED',donationIds: [1,4] }
  const donationIds = req.body.donationIds; // [1,4]
  const status = req.body.status.toUpperCase(); //COMPLETED, PENDING
  Donations.update(
    { settlementStatus: status },
    { where: { id: donationIds } }
  ).then(function () {
    req.flash("success", `Settlement status updated successfully`);
    res.redirect("back"); //todo : Bright render the page
  });
};
