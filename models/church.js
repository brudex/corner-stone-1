const Joi = require("joi");
const pagination = require("../utils/pagination");
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
        associate: (models) => {
          Church.hasMany(models.user);
        },
      },
    }
  );
  Church.validate = function (church) {
    const schema = Joi.object({
      name: Joi.string().min(1).max(256).required(),
      address: Joi.string().min(3).max(256).required(),
      phone: Joi.string().min(3).max(256).required(),
      email: Joi.string().email().min(3).max(256).required(),
      website: Joi.string().uri().allow(""),
      fbHandle: Joi.string().uri().allow(""),
      IGHandle: Joi.string().uri().allow(""),
      twitterHandle: Joi.string().uri().allow(""),
    });
    return schema.validate(church);
  };

  Church.paginate = function (req) {
    return pagination(this, req);
  };

  return Church;
};
