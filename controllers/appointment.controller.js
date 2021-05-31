const db = require("../models");
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

Controller.recurringAppointmentsView = async (req, res) => {
  const { churchId } = req.user;

  //1
  let appointmentDates = await AppointmentDate.findAll({
    where: { churchId, appointmentType: "recurring" },
    raw: true,
    order: [["createdAt", "DESC"]],
  });
  appointmentDates = JSON.parse(JSON.stringify(appointmentDates));

  const appointmentDateIds = appointmentDates.map(
    (appointmentDate) => appointmentDate.id
  );

  //2
  let appointmentTimes = await AppointmentTime.findAll({
    where: { appointmentDateId: { [Op.in]: appointmentDateIds } },
    raw: true,
  });
  appointmentTimes = JSON.parse(JSON.stringify(appointmentTimes));

  appointmentTimes.forEach((appointmentTime) => {
    appointmentDates.forEach((appointmentDate) => {
      if (appointmentDate.id === appointmentTime.appointmentDateId) {
        const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
        let recurringDays = "";
        appointmentTime.appointmentDate = appointmentDate.appointmentDate;
        days.forEach((day) => {
          if (appointmentDate[day] === 1) {
            recurringDays += `${day.toUpperCase()}, `;
          }
        });
        recurringDays = recurringDays.slice(0, -2);
        appointmentTime.recurringDays = recurringDays;
      }
    });
  });

  res.render("appointments/recurring-appointment", {
    title: "Available Recurring days",
    appointments: appointmentTimes,
    user: req.user,
  });
};
Controller.availableAppointmentsView = async (req, res) => {
  const { churchId } = req.user;

  //1
  let appointmentDates = await AppointmentDate.findAll({
    where: { churchId, appointmentType: "onetime" },
    raw: true,
    order: [["createdAt", "DESC"]],
  });
  appointmentDates = JSON.parse(JSON.stringify(appointmentDates));

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

Controller.setRecurringAppointmentView = async (req, res) => {
  res.render("appointments/set-recurring-appointment", {
    title: "Set Recurring Appointment",
    user: req.user,
  });
};

Controller.addAppointmentDate = async (req, res) => {
  const { churchId } = req.user;
  const recurring = req.body.recurring;

  let { date, times } = req.body;
  times = JSON.parse(times);

  let days;
  if (req.body.days) {
    days = JSON.parse(req.body.days);
  }

  if (!recurring) {
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
        appointmentType: "onetime",
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
  } else {
    //{
    // "days" : ["mon","tue","wed","thu","fri","sat","sun"],
    //}
    days.forEach(function (dayOfWeek) {
      const query = { where: { churchId: churchId } };
      query.where[dayOfWeek] = true;
      db.AppointmentDate.findOne(query).then(function (appointment) {
        if (appointment) {
          appointment.destroy();
        }
      });
    });
    const apptmntModel = {};
    apptmntModel.appointmentType = "recurring";
    apptmntModel.churchId = churchId;
    ["mon", "tue", "wed", "thu", "fri", "sat", "sun"].forEach(function (
      dayOfWeek
    ) {
      apptmntModel[dayOfWeek] = false;
    });
    days.forEach(function (dayOfWeek) {
      apptmntModel[dayOfWeek] = true;
    });
    db.AppointmentDate.create(apptmntModel).then(function (appointment) {
      times.forEach((time) => {
        time.appointmentDateId = appointment.id;
        time.appointmentTime = time.time;
        time.numberOfAllowedAppointments = time.allowedAppointments;
      });

      AppointmentTime.bulkCreate(times);
    });
  }
  res.send("ok");
};

Controller.setAppointment = async (req, res, next) => {
  //todo after implementation let Michael send date in addition to payload
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
        reason: "Appointment with provided ID not found",
      })
    );

  const appointmentsSet = await ChurchAppointments.count({
    where: { appointmentTimeId: appointmenttime.id, date: req.body.date },
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
    date: req.body.date,
    time: appointmenttime.appointmentTime,
    appointmentReason,
    appointmentTimeId,
  });
  res.json({ status_code: "00", message: "appointment created successfully" });
};

Controller.getAppointmentTimes = async (req, res, next) => {
  //todo test
  const { churchId } = req.user;
  const { date } = req.params;
  let appointmentDay;

  const dayOfWeek = getDayOfWeek(date);

  appointmentDay = await AppointmentDate.findOne({
    where: { appointmentDate: date, churchId },
  });

  let appointmentTimes = [];
  if (appointmentDay) {
    appointmentTimes = await AppointmentTime.findAll({
      where: { appointmentDateId: appointmentDay.id },
    });
  }

  const query = { where: { churchId } };
  query.where[dayOfWeek] = true;
  const appointment = await db.AppointmentDate.findOne(query);

  if (appointment) {
    const times = await AppointmentTime.findAll({
      where: { appointmentDateId: appointment.id },
    });
    console.log(times);
    appointmentTimes.push(...times);
  }

  if (appointmentTimes.length === 0)
    return next(
      createError(400, {
        status_code: "03",
        message: "request failed",
        reason: "No appointment times found for selected date",
      })
    );

  res.send({ status_code: "00", data: appointmentTimes });
};

function getDayOfWeek(date) {
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return days[new Date(date).getDay()]; //todo get day of week from date
}
