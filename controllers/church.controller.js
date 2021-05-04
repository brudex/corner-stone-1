const { sequelize, Sequelize } = require("../models/index");
const church = require("../models/church");
const Church = church(sequelize, Sequelize);
const Op = Sequelize.Op;
const debug = require("debug")("corner-stone:church-controller");
const multer = require("multer");
//utils
const { allowImagesOnly, storage } = require("../utils/image_upload");
const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: allowImagesOnly,
}).single("church-image");

const Controller = {};
module.exports = Controller;

//START VIEWS
Controller.churchesView = async (req, res, next) => {
  const paginationResults = await Church.paginate(req);
  res.render("church/churches", {
    title: "Churches",
    user: req.user,
    ...paginationResults,
  });
};

Controller.addChurchView = async (req, res, next) => {
  res.render("church/add-church", { title: "Add Church", user: req.user });
};

Controller.editChurchView = async (req, res, next) => {
  const { id } = req.params;
  const church = await Church.findOne({ raw: true, where: { id } });
  res.render("church/edit-church", {
    title: "Edit Church",
    user: req.user,
    values: church,
  });
};
//END VIEWS

Controller.getChurches = async (req, res, next) => {
  const churches = await Church.findAll({ raw: true });
  churches.forEach(
    (church) => (church.image = `${req.headers.host}/uploads/${church.image}`)
  );
  res.send(churches);
};

Controller.getChurch = async (req, res, next) => {
  const { churchId } = req.user;
  const church = await Church.findOne({ where: { id: churchId } });
  res.send(church);
};

Controller.addChurch = async (req, res, next) => {
  const page = "church/add-church";

  await upload(req, res, async (err) => {
    const { name, email, phone } = req.body;
    if (err) {
      req.flash("error", err);
      return res.render(page, { title: "Add Church", values: req.body });
    }
    const { error } = Church.validate(req.body);
    if (error) {
      req.flash("error", error.details[0].message);
      return res.render(page, { title: "Add Church", values: req.body });
    }
    const churchExists = await Church.findOne({
      where: { [Op.or]: [{ name }, { email }, { phone }] },
    });
    if (churchExists) {
      req.flash("error", "Church already exist");
      return res.render(page, { title: "Add Church", values: req.body });
    }
    await Church.create({ ...req.body, image: req.file.filename });
    req.flash("success", "Church added successfully");
    return res.render(page, { title: "Add Church" });
  });
};

Controller.editChurchImage = async (req, res) => {
  const { id } = req.params;
  const page = "church/edit-church";

  await upload(req, res, async (err) => {
    if (err) {
      req.flash("error", err);
      return res.render(page, { title: "Add Church", values: req.body });
    }
    const church = await Church.findOne({ where: { id } });
    if (!church) {
      req.flash("error", "Church not found");
      return res.redirect(`/churches/edit/${id}`);
    }
    church.image = req.file.filename;
    await church.save();

    req.flash("success", "Church image changed successfully");
    res.redirect(`/churches/edit/${id}`);
  });
};

Controller.editChurch = async (req, res) => {
  const page = "church/edit-church";
  const { id } = req.params;
  const { name, email, phone } = req.body;

  const { error } = Church.validate(req.body);
  if (error) {
    req.flash("error", error.details[0].message);
    return res.render(page, { title: "Edit Church", values: req.body });
  }

  const churchExists = await Church.findOne({
    where: { id: { [Op.ne]: id }, [Op.or]: [{ name }, { email }, { phone }] },
  });
  if (churchExists) {
    req.flash("error", "Church already exist");
    return res.render(page, { title: "Edit Church", values: req.body });
  }

  const church = await Church.findOne({ where: { id } });
  for (const [key, value] of Object.entries(req.body)) {
    church[key] = value;
  }

  await church.save();

  req.flash("success", "Church updated successfully");
  return res.redirect("/churches");
};

Controller.deleteChurch = async (req, res) => {
  const { id } = req.params;
  await Church.destroy({ where: { id } });
  req.flash("success", "Church deleted successfully");
  res.redirect("/churches");
};

Controller.bookAppointment = async (req, res) => {
  //get the user info and save the appointment
};

Controller.getAvailableAppointmentTimes = async (req, res) => {
  //get the user info and save the appointment
};
