const Joi = require("joi");
module.exports = (sequelize, DataTypes) => {
  const ChurchAppointments = sequelize.define(
    "ChurchAppointments",
    {
      churchId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
      appointmentReason: DataTypes.STRING,
      appointmentTimeId: DataTypes.INTEGER,
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
