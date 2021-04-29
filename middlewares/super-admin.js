module.exports = function (req, res, next) {
  console.log(req.user);
  if (!req.user) return res.redirect("/login");
  if (!req.user.isSuperAdmin) return res.redirect("/403");
  next();
};
