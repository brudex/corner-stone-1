const Joi = require("joi");
module.exports = (sequelize, DataTypes) => {
  const AppointmentDate = sequelize.define(
    "AppointmentDate",
    {
      churchId: DataTypes.INTEGER,
      appointmentDate: DataTypes.DATEONLY,
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
