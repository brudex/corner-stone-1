const Joi = require("joi");
module.exports = (sequelize, DataTypes) => {
  const UserPlayList = sequelize.define(
    "UserPlayList",
    {
      userId: DataTypes.INTEGER,
      churchContentId: DataTypes.INTEGER,
      title: DataTypes.STRING,
    },
    {
      tableName: "UserPlayList",
      classMethods: {
        associate: (models) => {},
      },
    }
  );
  UserPlayList.validateList = function (list) {
    const schema = Joi.object({
      churchContentId: Joi.number().integer().positive().required(),
      title: Joi.string().min(1).max(256).required(),
    });
    return schema.validate(list);
  };
  return UserPlayList;
};
