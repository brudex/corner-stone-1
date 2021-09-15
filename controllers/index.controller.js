const { sequelize, Sequelize } = require("../models/index");
const church = require("../models/church");
const Church = church(sequelize, Sequelize);
const user = require("../models/user");
const User = user(sequelize, Sequelize);
const appointment = require("../models/churchappointments");
const Appointment = appointment(sequelize, Sequelize);
const appointmentDay = require("../models/appointment_available_days");
const AppointmentDay = appointmentDay(sequelize, Sequelize);
const appointmentTime = require("../models/appointment_available_times");
const AppointmentTime = appointmentTime(sequelize, Sequelize);
const donation = require("../models/churchdonation");
const Donation = donation(sequelize, Sequelize);
const Op = Sequelize.Op;
const dateFns = require("date-fns");
const debug = require("debug")("corner-stone:index-controller");

const Controller = {};
module.exports = Controller;

Controller.index = async (req, res) => {
  const churchesCount = await Church.count();
  const usersCount = await User.count({
    where: { isSuperAdmin: { [Op.ne]: true } },
  });
  res.render("index", {
    title: "Express",
    user: req.user,
    data: { churchesCount, usersCount },
  });
};

Controller.churchAdminView = async (req, res) => {
  let appointmentsCount;
  const { churchId } = req.user;
  const donations = await Donation.sum("amount", {
    where: { churchId, createdAt: dateFns.format(new Date(), "yyyy-MM-dd") },
  });
  const membersCount = await User.count({
    where: { churchId, isAdmin: { [Op.ne]: true } },
  });
  const appointmentDate = await AppointmentDay.findOne({
    where: {
      churchId,
      appointmentDate: dateFns.format(new Date(), "yyyy-MM-dd"),
    },
  });

  if (!appointmentDate) {
    appointmentsCount = 0;
  } else {
    const appointmentTimeIds = await AppointmentTime.findAll({
      raw: true,
      where: { appointmentDateId: appointmentDate.id },
      attributes: ["id"],
    });
    if (appointmentTimeIds.length === 0) {
      appointmentsCount = 0;
    } else {
      debug(appointmentTimeIds);
      appointmentsCount = await Appointment.count({
        where: { [Op.or]: [...appointmentTimeIds] },
      });
    }
  }

  res.render("church-admin-dashboard", {
    title: "Express",
    user: req.user,
    data: { donations, membersCount, appointmentsCount },
  });
};

Controller._403 = (req, res) => {
  res.render("403", { title: "403", layout: "blank-layout" });
};

module.exports = Controller;
