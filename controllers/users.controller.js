const createError = require("http-errors");
const { sequelize, Sequelize } = require("../models/index");
const user = require("../models/user");
const User = user(sequelize, Sequelize);
const church = require("../models/church");
const Church = church(sequelize, Sequelize);
const bcrypt = require("bcrypt");
const Joi = require("joi");
const Op = Sequelize.Op;
const generator = require("generate-password");
const debug = require("debug")("corner-stone:userscontroller");

const Controller = {};
module.exports = Controller;

//START VIEWS

Controller.usersView = async (req, res, next) => {
  const paginationResults = await User.paginate(req, {
    isSuperAdmin: { [Op.ne]: true },
  });

  res.render("users/users", {
    title: "Users",
    user: req.user,
    ...paginationResults,
  });
};

Controller.churchMembersView = async (req, res, next) => {
  const { churchId } = req.user;
  const paginationResults = await User.paginate(req, {
    churchId,
    isAdmin: { [Op.ne]: true },
  });

  res.render("users/church-members", {
    title: "Church Members",
    user: req.user,
    ...paginationResults,
  });
};

Controller.addUserView = async (req, res) => {
  const churches = await Church.findAll({
    raw: true,
    attributes: ["id", "name"],
  });
  debug(churches);
  res.render("users/add-user", { title: "Add User", user: req.user, churches });
};

Controller.editUserView = async (req, res) => {
  const { id } = req.params;
  const churches = await Church.findAll({
    raw: true,
    attributes: ["id", "name"],
  });

  const user = await User.findOne({
    raw: true,
    where: { id },
  });
  if (!user) {
    req.flash("error", "User does not exist");
    return res.redirect("/users");
  }
  debug(churches);
  res.render("users/edit-user", {
    title: "Edit User",
    user: req.user,
    churches,
    values: user,
  });
};

//END VIEWS

Controller.addUser = async (req, res) => {
  const page = "users/add-user";
  const { email } = req.body;

  const churches = await Church.findAll({
    raw: true,
    attributes: ["id", "name"],
  });

  const password = generator.generate({
    length: 10,
    numbers: true,
  });
  const { error } = User.validateUser({ ...req.body, password });
  if (error) {
    req.flash("error", error.details[0].message);
    return res.render(page, { title: "Add User", values: req.body, churches });
  }

  const userExists = await User.findOne({ where: { email } });
  if (userExists) {
    req.flash("error", "Email already exist");
    return res.render(page, { title: "Add User", values: req.body, churches });
  }
  const hashedPassword = await User.hashPassword(password);
  await User.create({ ...req.body, isAdmin: true, password: hashedPassword });
  req.flash("success", "User added successfully");
  return res.render(page, { title: "Add User", churches });
};

Controller.editUser = async (req, res) => {
  const page = "users/edit-user";
  const { email } = req.body;
  const { id } = req.params;

  const churches = await Church.findAll({
    raw: true,
    attributes: ["id", "name"],
  });

  const { error } = User.validateUser(req.body, "update");
  if (error) {
    req.flash("error", error.details[0].message);
    return res.render(page, {
      title: "Edit User",
      values: { ...req.body, id },
      churches,
    });
  }

  const userExists = await User.findOne({
    where: { id: { [Op.ne]: id }, email },
  });
  if (userExists) {
    req.flash("error", "Email already exist");
    return res.render(page, {
      title: "Edit User",
      values: { ...req.body, id },
      churches,
    });
  }

  const user = await User.findOne({ where: { id } });
  for (const [key, value] of Object.entries(req.body)) {
    user[key] = value;
  }
  await user.save();
  req.flash("success", "User updated successfully");
  return res.render(page, {
    title: "Edit User",
    churches,
    values: user,
  });
};

Controller.deleteUser = async (req, res) => {
  const { id } = req.params;
  await User.destroy({ where: { id } });
  req.flash("success", "User deleted successfully");
  res.redirect("/users");
};

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

Controller.changePassword = async (req, res, next) => {
  const { id } = req.user;

  const { error } = User.validateChangePassword(req.body);
  if (error)
    return next(
      createError(400, {
        status_code: "03",
        message: "password change failed",
        reason: error.details[0].message,
      })
    );

  const hashedPassword = await User.hashPassword(req.body.password);
  await User.update({ password: hashedPassword }, { where: { id } });

  res.json({ status_code: "03", message: "password changed successfully" });
};

Controller.getUserDetails = async (req, res, next) => {
  const { id } = req.user;
  const user = await User.findOne({
    where: { id },
    attributes: ["firstName", "lastName", "email", "churchId"],
  });
  if (!user)
    return next(
      createError(404, {
        status_code: "03",
        message: "Request Failed",
        reason: "User not found",
      })
    );
  res.json({ status_code: "00", data: user });
};
