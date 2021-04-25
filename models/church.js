const Joi = require("joi");
module.exports = (sequelize, DataTypes) => {
  const Church = sequelize.define(
    "Church",
    {
      name: DataTypes.STRING,
      address: DataTypes.STRING,
      image: DataTypes.STRING,
      phone: DataTypes.STRING,
      email: DataTypes.STRING,
      website: DataTypes.STRING,
      fbHandle: DataTypes.STRING,
      IGHandle: DataTypes.STRING,
      twitterHandle: DataTypes.STRING,
    },
    {
      tableName: "Church",
      classMethods: {
        associate: (models) => {},
      },
    }
  );
  Church.validate = function (church) {
    const schema = Joi.object({
      name: Joi.string().min(1).max(256).required(),
      address: Joi.string().min(3).max(256).required(),
      phone: Joi.string().min(3).max(256).required(),
      email: Joi.string().email().min(3).max(256).required(),
      website: Joi.string().uri(),
      fbHandle: Joi.string().uri(),
      IGHandle: Joi.string().uri(),
      twitterHandle: Joi.string().uri(),
    });
    return schema.validate(church);
  };

  return Church;
};
