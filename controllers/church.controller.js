const { sequelize, Sequelize } = require("../models/index");
const db = require("../models/index");
const church = require("../models/church");
const Church = church(sequelize, Sequelize);
const Op = Sequelize.Op;
const debug = require("debug")("corner-stone:church-controller");
const multer = require("multer");
//utils
const { allowImagesOnly, storage } = require("../utils/upload");
const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: allowImagesOnly,
}).fields([{
  name: 'church-image', maxCount: 1
}, {
  name: 'pastor-image', maxCount: 1
}]);


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

Controller.churchAdmins = async (req, res, next) => {
  const church = await Church.findOne({ raw: true, where: { id :req.params.churchId } });
  const sql = 'SELECT u.firstName,u.lastName,u.email,uc.id from userchurches uc LEFT JOIN  `user` u on uc.userId=u.id where uc.isAdmin=TRUE and uc.churchId='+req.params.churchId;
  console.log('Admins query >>',sql);
  const admins = await  db.sequelize.query(sql,{ type: sequelize.QueryTypes.SELECT});
  res.render("church/admin-users", {
    title: "Admin Users",
    user: req.user,
    data:admins,
    church:church
  });
};

Controller.addChurchAdmin = async (req, res, next) => {
  const church = await Church.findOne({ raw: true, where: { id :req.params.churchId } });
   res.render("church/add-admin", {
    title: "Add Admin",
    user: req.user,
    church:church
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
  const churchId = req.user.churchId;//getUserCurrentChurchId(req.user);
  const church = await Church.findOne({ where: { id: churchId } });
  res.send(church);
};

async function getUserCurrentChurchId(reqUser){
  const user = await db.User.findOne({where:{id:reqUser.id}});
  return user.churchId;
}

Controller.addChurch = async (req, res, next) => {
  const page = "church/add-church";
  await upload(req, res, async (err) => {
    const { user } = req;
    const { name, email, phone } = req.body;
    if (err) {
      req.flash("error", err);
      return res.render(page, { title: "Add Church", values: req.body, user });
    }
    const { error } = Church.validate(req.body);
    if (error) {
      req.flash("error", error.details[0].message);
      return res.render(page, { title: "Add Church", values: req.body, user });
    }
    const churchExists = await Church.findOne({
      where: { [Op.or]: [{ name }, { email }, { phone }] },
    });
    if (churchExists) {
      req.flash("error", "Church already exist");
      return res.render(page, { title: "Add Church", values: req.body, user });
    }
    const churchRow = { ...req.body, image: req.files['church-image'][0].filename };
    if(req.files['pastor-image'].length){
      churchRow.pastorImage = req.files['pastor-image'][0].filename;
    }
    await Church.create();
    req.flash("success", "Church added successfully");
    return res.redirect("/churches");
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
  const { user } = req;
  const { id } = req.params;
  const { name, email, phone } = req.body;

  const { error } = Church.validate(req.body);
  if (error) {
    req.flash("error", error.details[0].message);
    return res.render(page, { title: "Edit Church", values: req.body, user });
  }

  const churchExists = await Church.findOne({
    where: { id: { [Op.ne]: id }, [Op.or]: [{ name }, { email }, { phone }] },
  });

  if (churchExists) {
    req.flash("error", "Church already exist");
    return res.render(page, { title: "Edit Church", values: req.body, user });
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
