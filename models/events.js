const Joi = require("joi");
module.exports = (sequelize, DataTypes) => {
  const Events = sequelize.define(
    "Events",
    {
      churchId: DataTypes.STRING,
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      eventVenue: DataTypes.STRING,
      eventDate: DataTypes.STRING,
      eventTime: DataTypes.STRING,
      imageBanner: DataTypes.STRING,
    },
    {
      tableName: "Events",
      classMethods: {
        associate: (models) => {},
      },
    }
  );

  return Events;
};
