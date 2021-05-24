const Joi = require("joi");
module.exports = (sequelize, DataTypes) => {
  const AppointmentDate = sequelize.define(
    "AppointmentDate",
    {
      churchId: DataTypes.INTEGER,
      appointmentDate: DataTypes.DATEONLY,
      appointmentType: DataTypes.STRING, //onetime, recurring
      sun: DataTypes.BOOLEAN,
      mon: DataTypes.BOOLEAN,
      tue: DataTypes.BOOLEAN,
      wed: DataTypes.BOOLEAN,
      thu: DataTypes.BOOLEAN,
      fri: DataTypes.BOOLEAN,
      sat: DataTypes.BOOLEAN
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
