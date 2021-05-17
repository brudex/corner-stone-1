const debug = require("debug")("corner-stone:admin-middleware");
module.exports = function (req, res, next) {
  if (req.user.isAdmin === false || req.user.isSuperAdmin === false)
    return res.redirect("/401");
  next();
};
