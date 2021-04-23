const Joi = require("joi");
module.exports = (sequelize, DataTypes) => {
  const DailyDevotional = sequelize.define(
    "DailyDevotional",
    {
      churchId: DataTypes.STRING,
      devotionalContent: DataTypes.STRING,
      dateToShow: DataTypes.DATE,
      isDefault: DataTypes.BOOLEAN,
    },
    {
      tableName: "DailyDevotional",
      classMethods: {
        associate: (models) => {},
      },
    }
  );

  DailyDevotional.validateDevotional = function (devotional) {
    const schema = Joi.object({
      churchId: Joi.number().integer().positive().required(),
      devotionalContent: Joi.string().min(1).max(10000).required(),
      dateToShow: Joi.date().required(),
      isDefault: Joi.boolean().required(),
    });
    return schema.validate(devotional);
  };

  return DailyDevotional;
};
