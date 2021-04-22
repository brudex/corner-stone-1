const Joi = require("joi");
module.exports = (sequelize, DataTypes) => {
  const ChurchAppointments = sequelize.define(
    "ChurchAppointments",
    {
      churchId: DataTypes.INTEGER,
      appointmentDay: DataTypes.INTEGER,
      appointmentTimes: DataTypes.INTEGER,

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
