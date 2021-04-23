const Joi = require("joi");
module.exports = (sequelize, DataTypes) => {
  const ChurchWorkingDay = sequelize.define(
    "ChurchWorkingDay",
    {
      churchId: DataTypes.INTEGER,
      day: DataTypes.STRING,
      time: DataTypes.STRING,
    },
    {
      tableName: "ChurchWorkingDay",
      classMethods: {
        associate: (models) => {},
      },
    }
  );
  ChurchWorkingDay.validate = function (church) {
    const schema = Joi.object({
      churchId: Joi.number().positive().integer(),
      day: Joi.string().min(1).max(256).required(),
      time: Joi.string().min(1).max(256).required(),
    });
    return schema.validate(church);
  };

  return ChurchWorkingDay;
};
