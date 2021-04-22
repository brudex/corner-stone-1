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
  return UserPlayList;
};
