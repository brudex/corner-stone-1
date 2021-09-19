const Joi = require("joi");
module.exports = (sequelize, DataTypes) => {
  const Events = sequelize.define(
    "Events",
    {
      churchId: DataTypes.STRING,
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      eventVenue: DataTypes.STRING,
      eventDate: DataTypes.DATE,
      eventTime: DataTypes.STRING,
      imageBanner: DataTypes.STRING
    },
    {
      tableName: "Events"
    }
  );

  Events.validateEvent = function (event) {
    const schema = Joi.object({
      churchId: Joi.number().positive().integer().required(),
      title: Joi.string().min(1).max(256).required(),
      description: Joi.string().min(1).max(10000).required(),
      eventVenue: Joi.string().min(1).max(256).required(),
      eventDate: Joi.date().required(),
      eventTime: Joi.string().regex(/^([0-9]{2})\:([0-9]{2})$/),
    });
    return schema.validate(event);
  };

  return Events;
};

