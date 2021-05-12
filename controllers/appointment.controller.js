const { sequelize, Sequelize } = require("../models/index");
const appointmentDate = require("../models/appointment_available_days");
const AppointmentDate = appointmentDate(sequelize, Sequelize);
const churchAppointments = require("../models/churchappointments");
const ChurchAppointments = churchAppointments(sequelize, Sequelize);
const appointmentTime = require("../models/appointment_available_times");
const AppointmentTime = appointmentTime(sequelize, Sequelize);
const user = require("../models/user");
const User = user(sequelize, Sequelize);
const dateFns = require("date-fns");
const { Op } = require("sequelize");
const createError = require("http-errors");
const debug = require("debug")("corner-stone:appointment-controller");

const Controller = {};
module.exports = Controller;

Controller.appointmentsView = async (req, res) => {
  const { churchId } = req.user;

  //1
  let appointments = await ChurchAppointments.findAll({
    where: { churchId },
    raw: true,
  });
  const appointmentIds = appointments.map(
    (appointment) => appointment.appointmentTimeId
  );
  appointments = JSON.parse(JSON.stringify(appointments));
  console.log(appointmentIds);

  //2
  let appointmentTimes = await AppointmentTime.findAll({
    where: { id: { [Op.in]: appointmentIds } },
    attributes: ["id", "appointmentDateId", "appointmentTime"],
    raw: true,
  });
  appointmentTimes = JSON.parse(JSON.stringify(appointmentTimes));
  console.log(appointmentTimes);
  const appointmentTimeIds = appointmentTimes.map(
    (appointmentTime) => appointmentTime.appointmentDateId
  );
  console.log(appointmentTimeIds);

  //3
  let appointmentDates = await AppointmentDate.findAll({
    where: { id: { [Op.in]: appointmentTimeIds } },
    raw: true,
  });
  appointmentDates = JSON.parse(JSON.stringify(appointmentDates));
  console.log(appointmentDates);

  appointmentDates.forEach((appointmentDate) => {
    appointmentTimes.forEach((appointmentTime) => {
      if (appointmentDate.id === appointmentTime.appointmentDateId)
        appointmentTime.appointmentDate = appointmentDate.appointmentDate;
    });
  });

  console.log(appointmentDates);

  ///4
  appointments.forEach((appointment) => {
    appointmentTimes.forEach((appointmentTime) => {
      if (appointmentTime.id === appointment.appointmentTimeId) {
        appointment.appointmentDate = appointmentTime.appointmentDate;
        appointment.appointmentTime = appointmentTime.appointmentTime;
      }
    });
  });
  //5
  const userIds = appointments.map((appointment) => appointment.userId);

  let users = await User.findAll({
    where: { id: { [Op.in]: userIds } },
    raw: true,
  });

  users = JSON.parse(JSON.stringify(users));

  appointments.forEach((appointment) => {
    users.forEach((user) => {
      if (user.id === appointment.userId)
        appointment.user = `${user.firstName} ${user.lastName}`;
    });
  });

  res.render("appointments/appointments", {
    title: "Appointments",
    user: req.user,
    appointments,
  });
};

Controller.availableAppointmentsView = async (req, res) => {
  const { churchId } = req.user;

  //1
  let appointmentDates = await AppointmentDate.findAll({
    where: { churchId },
    raw: true,
    order: [["createdAt", "DESC"]],
  });
  appointmentDates = JSON.parse(JSON.stringify(appointmentDates));
  console.log(appointmentDates);

  const appointmentDateIds = appointmentDates.map(
    (appointmentDate) => appointmentDate.id
  );

  //2
  let appointmentTimes = await AppointmentTime.findAll({
    where: { appointmentDateId: { [Op.in]: appointmentDateIds } },
    raw: true,
  });
  appointmentTimes = JSON.parse(JSON.stringify(appointmentTimes));
  console.log(appointmentTimes);

  appointmentTimes.forEach((appointmentTime) => {
    appointmentDates.forEach((appointmentDate) => {
      if (appointmentDate.id === appointmentTime.appointmentDateId)
        appointmentTime.appointmentDate = appointmentDate.appointmentDate;
    });
  });

  console.log(appointmentTimes);

  res.render("appointments/available-appointment-dates", {
    title: "Available Appointment times",
    appointments: appointmentTimes,
    user: req.user,
  });
};

Controller.addAppointmentDateView = async (req, res, next) => {
  const { user } = req;
  const { churchId } = user;
  let date = dateFns.format(new Date(), "yyyy-MM-dd");
  if (req.query.date)
    date = dateFns.format(new Date(req.query.date), "yyyy-MM-dd");

  debug(date);
  const appointmentDate = await AppointmentDate.findOne({
    where: { appointmentDate: date, churchId },
    attributes: ["id"],
  });
  debug(date);

  if (!appointmentDate) {
    req.flash("info", "No appointments found for selected date");
    return res.render("appointments/add-appointment-date", {
      title: "Add Apointment Date",
      user,
      date,
    });
  }

  const appointmentTimes = await AppointmentTime.findAll({
    where: { appointmentDateId: appointmentDate.id },
  });

  debug(appointmentTimes);

  res.render("appointments/add-appointment-date", {
    title: "Add Apointment Date",
    user,
    date,
  });
};

Controller.addAppointmentDate = async (req, res) => {
  const data = JSON.parse(JSON.stringify(req.body));
  let { date, times } = req.body;
  times = JSON.parse(times);
  const { churchId } = req.user;

  let appointmentDate = await AppointmentDate.findOne({
    where: { appointmentDate: date },
  });

  //Delete Availabe times if already exists
  if (appointmentDate) {
    await AppointmentTime.destroy({
      where: { appointmentDateId: appointmentDate.id },
    });
  }

  if (!appointmentDate) {
    appointmentDate = await AppointmentDate.create({
      appointmentDate: date,
      churchId,
    });
  }

  times.forEach((time) => {
    time.appointmentDateId = appointmentDate.id;
    time.appointmentTime = time.time;
    time.numberOfAllowedAppointments = time.allowedAppointments;
  });

  debug(times);

  await AppointmentTime.bulkCreate(times);

  res.send("ok");
};

Controller.setAppointment = async (req, res, next) => {
  const { churchId, id: userId } = req.user;
  const { appointmentTimeId, appointmentReason } = req.body;
  const appointmenttime = await AppointmentTime.findOne({
    where: { id: appointmentTimeId },
  });
  if (!appointmenttime)
    return next(
      createError(400, {
        status_code: "03",
        message: "set appointment failed",
        reason: "Appointments with provided ID not found",
      })
    );
  const appointmentsSet = await ChurchAppointments.count({
    where: { appointmentTimeId: appointmenttime.id },
  });

  if (appointmentsSet >= appointmenttime.numberOfAllowedAppointments)
    return next(
      createError(400, {
        status_code: "03",
        message: "set appointment failed",
        reason: "Maximum number of appointments reached",
      })
    );

  await ChurchAppointments.create({
    churchId,
    userId,
    appointmentReason,
    appointmentTimeId,
  });

  res.json({ status_code: "00", message: "appointment created successfully" });
};

Controller.getAppointmentTimes = async (req, res, next) => {
  const { churchId } = req.user;
  const { date } = req.params;

  const appointmentDay = await AppointmentDate.findOne({
    where: { appointmentDate: date, churchId },
  });
  if (!appointmentDay)
    return next(
      createError(400, {
        status_code: "03",
        message: "request failed",
        reason: "No appointments found for selected date",
      })
    );

  const appointmentTimes = await AppointmentTime.findAll({
    where: { appointmentDateId: appointmentDay.id },
  });

  if (!appointmentTimes)
    return next(
      createError(400, {
        status_code: "03",
        message: "request failed",
        reason: "No appointment times found for selected date",
      })
    );

  res.send({ status_code: "00", data: appointmentTimes });
};
