const Joi = require("joi");
module.exports = (sequelize, DataTypes) => {
  const ChurchDonation = sequelize.define(
    "ChurchDonation",
    {
      churchId: DataTypes.STRING,
      userId: DataTypes.STRING,
      amount: DataTypes.DECIMAL,
      paymentMode: DataTypes.DECIMAL,
      donationTypeId: DataTypes.INTEGER, // Donation Type ID
     },
    {
      tableName: "ChurchDonation",
      classMethods: {
        associate: (models) => {},
      },
    }
  );


  return ChurchDonation;
};
