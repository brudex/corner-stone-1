const { sequelize, Sequelize } = require("../models/index");
const user = require("../models/user");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
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

Controller.changePasswordView = (req, res) => {
  const { user } = req;
  res.render("account/change-password", { title: "Change Password", user });
};

Controller.changePassword = async (req, res) => {
  const { churchId, id } = req.user;
  const { password } = req.body;

  if (!(req.body.password && req.body.password.length >= 6)) {
    req.flash("error", "Password length must be at least 6");
    return res.redirect("/account/change-password");
  }

  const { error } = User.validateChangePassword(req.body);


  if (error) {
    req.flash("error", "passwords do not match");
    return res.redirect("/account/change-password");
  }

  const hashedPassword = await User.hashPassword(password);
  await User.update({ password: hashedPassword }, { where: { churchId, id } });

  req.flash("success", "Password Change Successful");
  res.redirect("/account/change-password");
};

Controller.editAccountView = (req, res) => {
  const { user } = req;
  res.render("account/edit-account", {
    title: "Edit Account",
    values: user,
    user,
  });
};

Controller.editAccount = async (req, res) => {
  const { id } = req.user;
  const { firstName, lastName, email } = req.body;

  const schema = Joi.object({
    firstName: Joi.string().min(1).max(256).required(),
    lastName: Joi.string().min(1).max(256).required(),
    email: Joi.string().email().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    req.flash("error", error.details[0].message);
    return res.redirect("/account/edit-account");
  }

  const user = await User.findOne({ where: { id } });

  if (!user) {
    req.flash("error", "User not found!");
    return res.redirect("/account/edit-account");
  }

  user.firstName = firstName;
  user.lastName = lastName;
  user.email = email;

  await user.save();

  req.session.passport.user.firstName = firstName;
  req.session.passport.user.lastName = lastName;
  req.session.passport.user.email = email;
  req.session.save(function (err) {
    req.flash("error", "Something went wrong");
    debug(err);
  });

  req.flash("success", "Account details updated succesfully");
  res.redirect("/account/edit-account");
};

module.exports = Controller;
