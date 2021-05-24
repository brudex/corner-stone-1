const Joi = require("joi");
module.exports = (sequelize, DataTypes) => {
  const ChurchAppointments = sequelize.define(
    "ChurchAppointments",
    {
      churchId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
      appointmentReason: DataTypes.STRING,
      appointmentTimeId: DataTypes.INTEGER,//todo no longer joining with appointment_times
      time: DataTypes.STRING, //time of appointment
      date: DataTypes.DATEONLY,  //date of appointment //yyyy-MM
    },
    {
      tableName: "ChurchAppointments",
      classMethods: {
        associate: (models) => {},
      },
    }
  );

  return ChurchAppointments;
};
