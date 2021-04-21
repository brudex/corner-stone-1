const Joi = require("joi");
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

  return ChurchDonationType;
};
