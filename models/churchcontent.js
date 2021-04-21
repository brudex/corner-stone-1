const Joi = require("joi");
module.exports = (sequelize, DataTypes) => {
  const ChurchContent = sequelize.define(
    "ChurchContent",
    {
      churchId: DataTypes.INTEGER, // churchId from church model
      title: DataTypes.STRING,
      contentType: DataTypes.STRING, //audio sermon, devotional text, videolinks
      videoUrl: DataTypes.STRING,
      audioLink: DataTypes.STRING,
      contentText: DataTypes.STRING,//devotional text

    },
    {
      tableName: "ChurchContent",
      classMethods: {
        associate: (models) => {},
      },
    }
  );
  return ChurchContent;
};
