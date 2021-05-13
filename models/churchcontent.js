const Joi = require("joi");
const pagination = require("../utils/pagination");
module.exports = (sequelize, DataTypes) => {
  const ChurchContent = sequelize.define(
    "ChurchContent",
    {
      churchId: DataTypes.INTEGER, // churchId from church model
      title: DataTypes.STRING,
      contentType: DataTypes.STRING, //audio sermon, devotional text, videolinks
      contentData: DataTypes.TEXT, // using contentData field to store content regardless of type.
    },
    {
      tableName: "ChurchContent",
      classMethods: {
        associate: (models) => {},
      },
    }
  );
  ChurchContent.validateContent = function (content) {
    const schema = Joi.object({
      churchId: Joi.number().positive().integer().required(),
      title: Joi.string().min(1).max(256).required(),
      contentType: Joi.string().valid("sermon", "devotional", "video"),
      contentData: Joi.string().min(1).max(10000).required(),
    });
    return schema.validate(content);
  };
  ChurchContent.createSermonUrl = function (content, req) {
    if (content.contentType === "sermon")
      content.contentData = `${req.protocol}://${req.headers.host}/uploads/sermons/${content.contentData}`;
  };
  ChurchContent.paginate = function (req, condition) {
    return pagination(this, req, condition);
  };
  return ChurchContent;
};
