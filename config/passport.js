const { sequelize, Sequelize } = require("../models/index");
const user = require("../models/user");
const db = require("../models/index");
const User = user(sequelize, Sequelize);
const church = require("../models/church");
const Church = church(sequelize, Sequelize);
const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;

const authenticateUser = async (email, password, done) => {
  let user = await User.findByEmail(email);
  let userChurch;
  if (!user) {
    return done(null, false, { message: "Invalid email or password provided" });
  }
  let isChurchAdmin = false;
  let isSuperAdmin=false;
  user.roleType ="admin";
  if(user.isSuperAdmin){
    isSuperAdmin=true;
  }else{
    userChurch =  await db.UserChurches.findOne({ where: { userId: user.id } });
    if(userChurch){
      if(userChurch.isAdmin){
        isChurchAdmin=true;
        user.churchId= userChurch.churchId;
        user.roleType= userChurch.roleType || "admin"
      }
    }
  }
  if(isSuperAdmin || isChurchAdmin){
     try {
       if (!(await bcrypt.compare(password, user.password))){
         return done(null, false, {
           message: "Invalid email or password provided",
         });
       }
       user.isSuperAdmin=isSuperAdmin;
       user.isAdmin = isChurchAdmin;
       return done(null, user);
     } catch (error) {
       done(error);
     }
   }else{
     return done(null, false, { message: "Access Forbidden!" });
   }
};

const initialize = async (passport) => {
  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    console.log("Passport serialize  user is >>>",id);
    try {
      const user = await User.findOne({ raw: true, where: { id } });
      console.log("The user is >>>",user.dataValues);
      if(user.isAdmin) {
        const church = await Church.findOne({
          where: { id: user.churchId },
          attributes: ["name"],
        });
        user.church = church.name;
      }
      done(null, user);
    } catch (err) {
      done(err, false);
    }
  });
};

module.exports = initialize;
