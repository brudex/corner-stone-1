const { sequelize, Sequelize } = require("../models/index");
const church = require("../models/church");
const Church = church(sequelize, Sequelize);
const multer = require("multer");
const path = require("path");
//utils
const allowImagesOnly = require("../utils/allowImagesOnly");

const Controller = {};
module.exports = Controller;

Controller.churchesView = async (req, res, next) => {
  const churches = await Church.findAll();
  res.render("churches", { title: "Churches", churches });
};

Controller.getChurches = async (req, res, next) => {
  const churches = await Church.findAll({ raw: true });
  churches.forEach(
    (church) => (church.image = `${req.headers.host}/uploads/${church.image}`)
  );
  res.send(churches);
};

Controller.addChurchView = async (req, res, next) => {
  res.render("add-church", { title: "Add Church" });
};

Controller.addChurch = async (req, res, next) => {
  const redirectUrl = "/churches/add";
  const storage = multer.diskStorage({
    destination: "./public/uploads",
    filename: (req, file, cb) => {
      cb(
        null,
        `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
      );
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter: allowImagesOnly,
  }).single("church-image");

  upload(req, res, async (err) => {
    if (err) {
      req.flash("error", err);
      return res.redirect(redirectUrl);
    }

    const { error } = Church.validate(req.body);
    if (error) {
      req.flash("error", error.details[0].message);
      return res.redirect(redirectUrl);
    }
    const churchExists = await Church.findOne({
      where: { name: req.body.name },
    });
    if (churchExists) {
      req.flash("error", "Church already exist");
      return res.redirect(redirectUrl);
    }
    await Church.create({ ...req.body, image: req.file.filename });
    req.flash("success", "Church added successfully");
    return res.redirect(redirectUrl);
  });
};

Controller.bookAppointment = async (req, res) => {
  //get the user info and save the appointment
};

Controller.getAvailableAppointmentTimes = async (req, res) => {
  //get the user info and save the appointment
};
