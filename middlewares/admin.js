module.exports = function (req, res, next) {
  console.log(req.user);
  if (!req.user) return res.redirect("/login");
  if (req.user.isSuperAdmin === false && req.user.isAdmin === false)
    return res.redirect("/403");
  next();
};
