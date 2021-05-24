const Joi = require("joi");
module.exports = (sequelize, DataTypes) => {
  const AppointmentDate = sequelize.define(
    "AppointmentDate",
    {
      churchId: DataTypes.INTEGER,
      day: DataTypes.STRING,
      appointment: DataTypes.STRING, //onetime, recurring
    },
    {
      tableName: "AppointmentDate",
      classMethods: {
        associate: (models) => {},
      },
    }
  );

  return AppointmentDate;
};
