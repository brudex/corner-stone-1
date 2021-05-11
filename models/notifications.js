const Joi = require("joi");
module.exports = (sequelize, DataTypes) => {
  const Notifications = sequelize.define(
    "Events",
    {
      churchId: DataTypes.INTEGER,
      title: DataTypes.STRING,
      body: DataTypes.TEXT,
    },
    {
      tableName: "Notifications",
      classMethods: {
        associate: (models) => {},
      },
    }
  );

  Notifications.validateNotification = function (event, type = "admin") {
    const schema = Joi.object({
      churchId: Joi.number()
        .alter({
          admin: (schema) => schema.required(),
          superAdmin: (schema) => schema.forbidden(),
        })
        .positive()
        .integer()
        .required(),
      title: Joi.string().min(1).max(256).required(),
      description: Joi.string().min(1).max(10000).required(),
    });
    return schema.tailor(type).validate(event);
  };

  return Notifications;
};
