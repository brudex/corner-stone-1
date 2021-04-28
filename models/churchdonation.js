const Joi = require("joi");
module.exports = (sequelize, DataTypes) => {
  const ChurchDonation = sequelize.define(
    "ChurchDonation",
    {
      churchId: DataTypes.STRING,
      userId: DataTypes.INTEGER,
      pageId: DataTypes.STRING,
      amount: DataTypes.DECIMAL,
      paymentMode: DataTypes.STRING, //stripe,paypal
      donationTypeId: DataTypes.INTEGER, // Donation Type ID
      paymentStatus: DataTypes.STRING, // 00=success,01=pending,03=failed,
      statusMessage: DataTypes.STRING
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
