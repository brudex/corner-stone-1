module.exports = function (req, res, next) {
  if (!req.user.isAdmin) return res.redirect("/401");
  next();
};
