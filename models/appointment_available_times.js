const Joi = require("joi");
module.exports = (sequelize, DataTypes) => {
  const AvailableAppointmentTime = sequelize.define(
    "AvailableAppointmentTime",
    {
      appointmentDateId: DataTypes.INTEGER,
      appointmentTime: DataTypes.STRING,
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
