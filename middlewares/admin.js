const debug = require("debug")("corner-stone:admin-middleware");
module.exports = function (req, res, next) {
  debug(req.user);
  if (req.user.isAdmin === false || req.user.isSuperAdmin === false)
    return res.redirect("/401");
  next();
};
