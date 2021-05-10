const Joi = require("joi");
const pagination = require("../utils/pagination");

module.exports = (sequelize, DataTypes) => {
  const ChurchDonationType = sequelize.define(
    "ChurchDonationType",
    {
      churchId: DataTypes.INTEGER,
      donationType: DataTypes.STRING,
    },
    {
      tableName: "ChurchDonationType",
      classMethods: {
        associate: (models) => {},
      },
    }
  );

  ChurchDonationType.paginate = function (req, condition) {
    return pagination(this, req, condition);
  };

  return ChurchDonationType;
};
