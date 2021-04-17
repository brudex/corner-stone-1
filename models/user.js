// Example model
const Joi = require("joi");
const CustomJoi = Joi.extend(require("joi-phone-number"));
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      gender: DataTypes.STRING,
      phoneNumber: DataTypes.STRING,
      email: { type: DataTypes.STRING, unique: true },
      address: DataTypes.STRING,
      churchId: DataTypes.STRING,
      password: DataTypes.STRING,
      isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "User",
      classMethods: {
        associate: (models) => {},
      },
    }
  );

  User.hashPassword = function (password) {
    return bcrypt.hash(password, 10);
  };

  User.validateUser = function (user) {
    const schema = CustomJoi.object({
      firstName: CustomJoi.string().min(1).max(256).label("first name"),
      lastName: CustomJoi.string().min(1).max(256).label("last name"),
      gender: CustomJoi.string().valid("M", "F", "m", "f"),
      phoneNumber: CustomJoi.string()
        .phoneNumber({ defaultCountry: "GH", strict: true })
        .label("phone number"),
      email: CustomJoi.string().email().required(),
      address: CustomJoi.string().required(),
      churchId: CustomJoi.number().min(1).required(),
      password: CustomJoi.string().min(6).max(256).required(),
    });
    return schema.validate(user);
  };

  User.validateDetails = function (userDetails) {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).max(256).required(),
    });
    return schema.validate(userDetails);
  };

  User.prototype.generateAuthToken = function () {
    return jwt.sign(
      {
        id: this.id,
        isAdmin: this.isAdmin,
        branch: this.branch || "",
        churchId: this.churchId,
      },
      process.env.JWT_SECRET
    );
  };

  return User;
};
