const Joi = require("joi");
module.exports = (sequelize, DataTypes) => {
  const DailyDevotional = sequelize.define(
    "DailyDevotional",
    {
      churchId: DataTypes.STRING,
      devotionalContent: DataTypes.STRING,
      dateToShow: DataTypes.DATE,
      isDefault: DataTypes.BOOLEAN
     },
    {
      tableName: "DailyDevotional",
      classMethods: {
        associate: (models) => {},
      },
    }
  );


  return DailyDevotional;
};
