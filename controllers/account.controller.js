const { sequelize, Sequelize } = require("../models/index");
const user = require("../models/user");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const config = require("../config/config");
const debug = require("debug")("corner-stone:account-controller");
const User = user(sequelize, Sequelize);
const Controller = {};
module.exports = Controller;

//todo implement
Controller.loginView = (req, res) => {
  res.render("login", { title: "Login", layout: "blank-layout" });
};

//todo implement
Controller.register = (req, res) => {
  res.render("register", { title: "Express" });
};

Controller.logout = (req, res) => {
  req.logout();
  res.redirect("/login");
};

Controller.forgotPasswordView = (req, res) => {
  res.render("forgot-password", {
    title: "Forgotten password",
    layout: "blank-layout",
  });
};

Controller.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const userExist = await User.findByEmail(email);
  debug(userExist);
  if (!userExist) {
    //False success message (security measure)
    req.flash(
      "success",
      "We have sent an email with password reset instructions."
    );
    return res.redirect("/forgotpassword");
  }
  User.sendResetPasswordMail(email, req);

  req.flash(
    "success",
    "We have sent you an email with password reset instructions."
  );

  res.redirect("/forgotpassword");
};

Controller.resetPasswordView = async (req, res) => {
  res.render("reset-password", {
    title: "Reset Password",
    layout: "blank-layout",
  });
};

Controller.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  const { error } = User.validatePasswordReset(req.body);
  if (error) {
    req.flash("error", error.details[0].message);
    return res.redirect(`/resetpassword/${token}`);
  }

  const decoded = await jwt.verify(token, config.jwt_secret);
  debug(decoded);
  if (!decoded) {
    req.flash("error", "user not found");
    return res.redirect(`/resetpassword/${token}`);
  }

  const user = await User.findByEmail(decoded.email, false);
  if (!user) {
    req.flash("error", "user not found");
    return res.redirect(`/resetpassword/${token}`);
  }

  const hashedPassword = await User.hashPassword(password);

  user.password = hashedPassword;
  await user.save();

  req.flash("success", "password reset successful");
  res.redirect(`/resetpassword/${token}`);
};

module.exports = Controller;
