const { sequelize, Sequelize } = require("../models/index");
const user = require("../models/User");
const User = user(sequelize, Sequelize);
const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;

const authenticateUser = async (email, password, done) => {
  let user = await User.findByEmail(email);
  if (!user)
    return done(null, false, { message: "Invalid email or password provided" });

  try {
    if (!(await bcrypt.compare(password, user.password)))
      return done(null, false, {
        message: "Invalid email or password provided",
      });
    return done(null, user);
  } catch (error) {
    done(error);
  }
};

const initialize = async (passport) => {
  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findOne({ raw: true, where: { id } });
      done(null, user);
    } catch (err) {
      done(err, false);
    }
  });
};

module.exports = initialize;
