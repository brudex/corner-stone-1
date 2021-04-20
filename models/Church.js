const Joi = require("joi");
module.exports = (sequelize, DataTypes) => {
  const Church = sequelize.define(
    "Church",
    {
      name: DataTypes.STRING,
      address: DataTypes.STRING,
      image: DataTypes.STRING,
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
    });
    return schema.validate(church);
  };

  return Church;
};
