module.exports = function (req, res, next) {
  if (!req.user.isSuperAdmin) return res.redirect("/church");
  next();
};
