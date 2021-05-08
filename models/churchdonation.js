const Joi = require("joi");
const pagination = require("../utils/pagination");

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
      statusMessage: DataTypes.STRING,
    },
    {
      tableName: "ChurchDonation",
      classMethods: {
        associate: (models) => {},
      },
    }
  );

  ChurchDonation.paginate = function (req, condition) {
    return pagination(this, req, condition);
  };

  return ChurchDonation;
};
