const createError = require("http-errors");
const { sequelize, Sequelize } = require("../models/index");
const user = require("../models/user");
const User = user(sequelize, Sequelize);
const bcrypt = require("bcrypt");
const Joi = require("joi");
const debug = require("debug")("corner-stone:userscontroller");

const Controller = {};
module.exports = Controller;

Controller.registerUser = async (req, res, next) => {
  const failed = { status_code: "03", message: "Registration failed" };
  const { email, password } = req.body;
  const { error } = User.validateUser(req.body);
  if (error)
    return next(
      createError(400, { ...failed, reason: error.details[0].message })
    );

  //check if email exists
  const userExist = await User.findByEmail(email);
  if (userExist)
    return next(
      createError(400, { ...failed, reason: "Email already exists" })
    );

  //Hash password
  const hashedPassword = await User.hashPassword(password);

  const user = await User.create({ ...req.body, password: hashedPassword });
  const token = user.generateAuthToken();
  res
    .header("Authorization", `Bearer ${token}`)
    .header("access-control-expose-headers", "Authorization")
    .json({ status_code: "00", message: "Registration successful", token });
};

Controller.login = async (req, res, next) => {
  const { email, password } = req.body;
  const failed = { status_code: "03", message: "login failed" };

  const { error } = User.validateDetails(req.body);
  if (error)
    return next(
      createError(400, {
        reason: error.details[0].message,
      })
    );

  const user = await User.findByEmail(email, false);
  if (!user)
    return next(
      createError(400, { ...failed, reason: "Invalid email or password" })
    );

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword)
    return next(
      createError(400, { ...failed, reason: "Invalid email or password" })
    );

  const token = user.generateAuthToken();

  res
    .header("Authorization", `Bearer ${token}`)
    .header("access-control-expose-headers", "Authorization")
    .json({ token, status_code: "00", message: "login successful" });
};

Controller.resetPassword = async (req, res, next) => {
  const failed = { status_code: "03", message: "password reset failed" };
  const { email } = req.body;
  const schema = Joi.string().email().required().label("Email");
  const { error } = schema.validate(email);

  if (error)
    return next(
      createError(400, { ...failed, reason: error.details[0].message })
    );
  const userExist = await User.findByEmail(email);
  debug(userExist);
  if (!userExist)
    return res.json({
      status_code: "00",
      message: "We have sent an email with password reset instructions.",
    }); //False success message (security measure)
  await User.sendResetPasswordMail(email, req);

  res.json({
    status_code: "00",
    message: "We have sent an email with password reset instructions.",
  });
};

module.exports = Controller;
