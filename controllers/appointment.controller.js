const { sequelize, Sequelize } = require("../models/index");
const appointmentDate = require("../models/appointment_available_days");
const AppointmentDate = appointmentDate(sequelize, Sequelize);
const churchAppointments = require("../models/churchappointments");
const ChurchAppointments = churchAppointments(sequelize, Sequelize);
const appointmentTime = require("../models/appointment_available_times");
const AppointmentTime = appointmentTime(sequelize, Sequelize);
const dateFns = require("date-fns");
const createError = require("http-errors");

const Controller = {};
module.exports = Controller;
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
