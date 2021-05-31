const Joi = require("joi");
module.exports = (sequelize, DataTypes) => {
  const AppointmentDate = sequelize.define(
    "RecurringAppointment",
    {
      churchId: DataTypes.INTEGER,
      day: DataTypes.STRING,
      appointment: DataTypes.STRING, //onetime, recurring
    },
    {
      tableName: "RecurringAppointment",
      classMethods: {
        associate: (models) => {},
      },
    }
  );

  return AppointmentDate;
};
