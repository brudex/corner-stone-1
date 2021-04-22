const Joi = require("joi");
module.exports = (sequelize, DataTypes) => {
  const FeaturedContent = sequelize.define(
    "ChurchContent",
    {
      churchId: DataTypes.INTEGER, // churchId from church model
      churchContentId: DataTypes.INTEGER,
    },
    {
      tableName: "FeaturedContent",
      classMethods: {
        associate: (models) => {},
      },
    }
  );
  return FeaturedContent;
};
