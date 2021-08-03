const createError = require("http-errors");
const db = require("../models/index");
const { sequelize, Sequelize } = require("../models/index");
const user = require("../models/user");
const User = user(sequelize, Sequelize);
const church = require("../models/church");
const Church = church(sequelize, Sequelize);
const churchcontent = require("../models/churchcontent");
const ChurchContent = churchcontent(sequelize, Sequelize);
const user_playlist = require("../models/user_playlist");
const UserPlaylist = user_playlist(sequelize, Sequelize);
const bcrypt = require("bcrypt");
const Joi = require("joi");
const multer = require("multer");
const Op = Sequelize.Op;
const generator = require("generate-password");
const debug = require("debug")("corner-stone:userscontroller");
const _ = require("lodash");

//Image upload config
const { allowImagesOnly, storage } = require("../utils/upload");
const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: allowImagesOnly,
}).single("user-image");

const Controller = {};
module.exports = Controller;

//START VIEWS

Controller.usersView = async (req, res, next) => {
  const paginationResults = await User.paginate(req, {
    isSuperAdmin: { [Op.ne]: true },
  });

  paginationResults.data = JSON.parse(JSON.stringify(paginationResults.data));

  const userIds = paginationResults.data.map((data) => data.churchId);

  const churches = await Church.findAll({
    where: { id: { [Op.in]: userIds } },
    attributes: ["id", "name"],
    raw: true,
  });

  paginationResults.data.forEach((user) => {
    const userChurch = churches.filter(
      (church) => church.id === user.churchId
    )[0];
    if(userChurch){
      user.church = userChurch.name;
    }
  });

  debug(paginationResults.data);

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
  const { error } = User.validateUser(
    { ...req.body, password },
    { userType: "admin" }
  );
  if (error) {
    req.flash("error", error.details[0].message);
    return res.render(page, {
      title: "Add User",
      values: req.body,
      churches,
      user: req.user,
    });
  }

  const userExists = await User.findOne({ where: { email } });
  if (userExists) {
    req.flash("error", "Email already exist");
    return res.render(page, {
      title: "Add User",
      values: req.body,
      churches,
      user: req.user,
    });
  }

  const userChurch = churches.find(
    (church) => church.id.toString() === req.body.churchId.toString()
  );
  if (!userChurch) {
    {
      req.flash("error", "Church already exist");
      return res.render(page, {
        title: "Add User",
        values: req.body,
        churches,
        user: req.user,
      });
    }
  }
  const hashedPassword = await User.hashPassword(password);
  await User.create({ ...req.body, isAdmin: true, password: hashedPassword });

  User.sendWelcomeMail(req, { email, password, church: userChurch.name });

  req.flash("success", "User added successfully");
  res.render(page, { title: "Add User", churches, user: req.user });
};

Controller.editUser = async (req, res) => {
  const page = "users/edit-user";
  const { email } = req.body;
  const { id } = req.params;

  const churches = await Church.findAll({
    raw: true,
    attributes: ["id", "name"],
  });

  const { error } = User.validateUser(req.body, {
    requestType: "update",
    userType: "admin",
  });
  if (error) {
    req.flash("error", error.details[0].message);
    return res.render(page, {
      title: "Edit User",
      values: { ...req.body, id },
      churches,
      user: req.user,
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
      user: req.user,
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
    user: req.user,
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
  const { error } = User.validateUser(req.body, {});

  if (error)
    return res
      .status(400)
      .json({ ...failed, reason: error.details[0].message });

  if (!req.body.fcm_token)
    return res
      .status(400)
      .json({ ...failed, reason: "fcm is a required field" });

  //check if email exists
  const userExist = await User.findByEmail(email);
  if (userExist)
    return res.status(400).json({ ...failed, reason: "Email already exists" });

  //Hash password
  const hashedPassword = await User.hashPassword(password);


  const user = await User.create({ ...req.body, password: hashedPassword });

  const userChurch = {};
  userChurch.churchId= req.body.churchId;
  userChurch.userId = user.id;
  await db.UserChurches.create(userChurch);

  const token = user.generateAuthToken();
  res
    .header("Authorization", `Bearer ${token}`)
    .header("access-control-expose-headers", "Authorization")
    .json({ status_code: "00", message: "Registration successful", token });
};



Controller.joinChurch = async (req, res, next) => {
  const joinedChurches = await db.UserChurches.findAll({where:{userId:req.user.id,churchId:req.body.churchId}});
  if(joinedChurches.length){
    return next(
        createError(400, {
          status_code: "03",
          message: "User already a member of this church",
          reason: "User already a member of this church"
        })
    );
  }
  const userChurch = {};
  userChurch.churchId= req.body.churchId;
  userChurch.userId = req.user.id;
 const church = await db.Church.findOne({where:{id:req.body.churchId}});
 if(church){
   await db.UserChurches.create(userChurch);
   res.json({
     status_code: "00",
     message: "You have successfully joined the church.",
   });
 }else{
   res.status(404).json({
     status_code: "404",
     message: "Church not found invalid church.",
   });
 }

};

Controller.leaveChurch = async (req, res, next) => {
  const joinedChurch = await db.UserChurches.findOne({where:{userId:req.user.id,churchId:req.body.churchId}});
  if(joinedChurch){
    joinedChurch.destroy();
     const user = await db.User.find({where:{id:req.user.id}});
    if(user){
      if(user.churchId===joinedChurch.id){
        user.churchId=0;
        user.save();
      }
    }
    res.json({
      status_code: "00",
      message: "You have successfully left the church.",
    });
  }else{
    res.status(404).json({
      status_code: "404",
      message: "User not a member of church",
    });
  }
};

Controller.setCurrentChurch = async (req, res, next) => {

  const currentChurch = await db.Church.findOne({where:{id: req.params.churchId}});
  if(currentChurch){
     const loggedInUser = await db.User.find({where:{id:req.user.id}});
     loggedInUser.churchId = currentChurch.id;
     loggedInUser.save();
     res.json({
      status_code: "00",
      message: "Current Church successfully set to " + currentChurch.name
    });
  }else{
    res.status(404).json({
      status_code: "404",
      message: "Church not found",
    });
  }
};


Controller.myChurches = async (req, res, next) => {
  const sql = 'select  c.id,c.name,c.address,c.image,c.phone,c.email,c.website,c.fbHandle,c.IGHandle,c.twitterHandle,c.youTubeUrl from UserChurches u left join Church c on u.churchId=c.id where u.userId='+req.user.id;
  console.log('Church query >>',sql);
  const churches = await  db.sequelize.query(sql,{ type: sequelize.QueryTypes.SELECT});
  res.json({
    status_code: "00",
    data:churches,
  });
};

Controller.login = async (req, res, next) => {
  const { email, password, fcm_token } = req.body;
  const failed = { status_code: "03", message: "login failed" };

  const { error } = User.validateDetails(req.body);
  if (error)
    return next(
      createError(400, { ...failed, reason: error.details[0].message })
    );

  const user = await User.findByEmail(email, false);
  if (!user)
    return next(
      createError(400, { ...failed, reason: "Invalid email or password" })
    );

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword)
    return res
      .status(400)
      .json({ ...failed, reason: "Invalid email or password" });

  const token = user.generateAuthToken();

  //update fcm token
  await User.update({ fcm_token }, { where: { email } });
  const sql = 'select  c.id,c.name,c.address,c.image,c.phone,c.email,c.website,c.fbHandle,c.IGHandle,c.twitterHandle,c.youTubeUrl from UserChurches u left join Church c on u.churchId=c.id where u.userId='+user.id;
  const churches = await  db.sequelize.query(sql,{ type: sequelize.QueryTypes.SELECT});
  res
    .header("Authorization", `Bearer ${token}`)
    .header("access-control-expose-headers", "Authorization")
    .json({ token, status_code: "00", message: "login successful",churches:churches });
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
  const { password, oldPassword } = req.body;
  const failed = { status_code: "03", message: "login failed" };

  const { error } = User.validateChangePassword(req.body);
  if (error)
    return next(
      createError(400, {
        status_code: "03",
        message: "password change failed",
        reason: error.details[0].message,
      })
    );

  const user = await User.findOne({ where: { id }, attributes: ["password"] });

  const isValidPassword = await bcrypt.compare(oldPassword, user.password);
  if (!isValidPassword)
    return next(
      createError(400, { ...failed, reason: "Invalid old password" })
    );

  const hashedPassword = await User.hashPassword(password);
  await User.update({ password: hashedPassword }, { where: { id } });

  res.json({ status_code: "00", message: "password changed successfully" });
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

Controller.uploadProfilePicture = async (req, res, next) => {
  const { churchId, id } = req.user;

  await upload(req, res, async (err) => {
    if (err)
      return next(
        createError(400, {
          status_code: "03",
          message: "Image Upload Failed",
          reason: err,
        })
      );

    const user = await User.findOne({ where: { id, churchId } });
    if (!user)
      return next(
        createError(400, {
          status_code: "03",
          message: "User not found",
          reason: err,
        })
      );
    user.image = req.file.filename;
    await user.save();

    const imageUrl = `${req.protocol}://${req.headers.host}/uploads/${req.file.filename}`;
    res.json({ status_code: "00", imageUrl });
  });
};

Controller.getUserPlayList = async (req, res, next) => {
  const { id } = req.user;
  const userplaylistIds = await UserPlaylist.findAll({
    where: { userId: id },
    attributes: ["churchContentId"],
    raw: true,
  });

  debug(userplaylistIds);

  const userplaylist = userplaylistIds.map((list) => {
    return { id: list.churchContentId };
  });

  const playlist = await ChurchContent.findAll({
    where: { [Op.or]: userplaylist },
  });
  res.json({ status_code: "00", data: playlist });
};

Controller.getUserPicture = async (req, res, next) => {
  const { id } = req.user;
  const user = await User.findOne({ where: { id }, attributes: ["image"] });

  if (!user.image)
    return next(
      createError(400, {
        status_code: "03",
        message: "request failed",
        reason: "Image not found",
      })
    );

  const imageUrl = `${req.protocol}://${req.headers.host}/uploads/${user.image}`;

  res.json({ status_code: "00", data: imageUrl });
};

Controller.editUserDetails = async (req, res, next) => {
  const { id } = req.user;
  const { firstName, lastName } = req.body;

  const { error } = User.validateEditUser(req.body);
  if (error)
    return res.status(400).json({
      status_code: "03",
      message: "Request Failed",
      reason: error.details[0].message,
    });

  await User.update({ firstName, lastName }, { where: { id } });
  res.json({ status_code: "00", message: "User Details updated Successfully" });
};
