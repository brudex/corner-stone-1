// Example model
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sendMail = require("../utils/sendMail");
const config = require("../config/config");
const pagination = require("../utils/pagination");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: { type: DataTypes.STRING, unique: true, allowNull: false },
      churchId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
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

  User.findByEmail = async function (email, raw = true) {
    return await this.findOne({ raw, where: { email } });
  };

  User.validateUser = function (user) {
    const schema = Joi.object({
      firstName: Joi.string().min(1).max(256).required(),
      lastName: Joi.string().min(1).max(256).required(),
      email: Joi.string().email().required(),
      churchId: Joi.number().min(1).required(),
      password: Joi.string().min(6).max(256).required(),
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

  User.validatePasswordReset = function (passwords) {
    const schema = Joi.object({
      token: Joi.string().required(),
      password: Joi.string().min(6).max(256).required().label("Password"),
      confirmPassword: Joi.any()
        .equal(Joi.ref("password"))
        .required()
        .label("Confirm password")
        .messages({ "any.only": "passwords do not match" }),
    });
    return schema.validate(passwords);
  };

  User.sendResetPasswordMail = async function (email, req) {
    const token = await jwt.sign({ email }, config.jwt_secret);

    const hostname = `${req.protocol}://${req.headers.host}`;
    const options = {
      from: '"noreply"<test@senyotheart.com>',
      to: email,
      subject: "Corner Stone",
      html: `<DOCTYPE html>
        <html>
          <body>          
            <p>Hi there, you're receiving this mail because you initiated a password reset. <strong>If this wasn't you, please ignore</strong>.</p>
            <p>Click on the link below to reset your password!</p>
            <a href="${hostname}/resetpassword/${token}">Click here to reset your password</a>
          </body>
        </html>`,
    };

    sendMail(options);
  };

  User.paginate = function (req) {
    return pagination(this, req);
  };
  User.prototype.generateAuthToken = function () {
    return jwt.sign(
      {
        id: this.id,
        isAdmin: this.isAdmin,
        churchId: this.churchId,
      },
      config.jwt_secret
    );
  };

  return User;
};
