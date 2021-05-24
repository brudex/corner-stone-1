const Joi = require("joi");
module.exports = (sequelize, DataTypes) => {
  const AvailableAppointmentTime = sequelize.define(
    "AvailableAppointmentTime",
    {
      appointmentDateId: DataTypes.INTEGER,
      appointmentTime: DataTypes.STRING, //17:00
      numberOfAllowedAppointments: DataTypes.INTEGER,
    },
    {
      tableName: "AvailableAppointmentTime",
      classMethods: {
        associate: (models) => {},
      },
    }
  );

  return AvailableAppointmentTime;
};
