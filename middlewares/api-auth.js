const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const debug = require("debug")("corner-stone:api-auth");

module.exports = function (req, res, next) {
  if (!req.header("Authorization"))
    return next(
      createError(401, {
        status_code: "03",
        message: "request failed",
        reason: "Access denied, missing auth token",
      })
    );

  let token = req.header("Authorization");
  token = req.headers.authorization.split(" ")[1];
  debug(token);
  if (!token)
    return next(
      createError(401, {
        status_code: "03",
        message: "request failed",
        reason: "Access denied, missing auth token",
      })
    );

  try {
    const decoded = jwt.verify(token, config.jwt_secret);
    req.user = decoded;
    next();
  } catch (e) {
    debug(e);
    res.status(400).json({
      status_code: "03",
      message: "request failed",
      reason: "Invalid token",
    });
  }
};
