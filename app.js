const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const flash = require("express-flash");
const passport = require("passport");
const initializePassport = require("./config/passport");
var MemoryStore = require("memorystore")(session);
require("dotenv").config();

var pageRoutes = require("./routes/page");
const apiRoutes = require("./routes/api");
const config = require("./config/config");

var app = express();

initializePassport(passport);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//passport config
app.use(
  session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
    secret: config.jwt_secret,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use("/", pageRoutes);
app.use("/api", apiRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  if (req.path === "/api") return next(createError(404));
  res.render("errors/404", { title: "404", layout: "blank-layout" });
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  console.log(err);
  res.status(err.status || 500);
  if (req.path === "/api") return res.json(err);
  res.render(`errors/${err.status || 500}`, {
    title: err.status || 500,
    layout: "blank-layout",
  });
});

module.exports = app;
