const Controller = {};
module.exports = Controller;

//todo implement
Controller.loginView = (req, res) => {
  res.render("login", { title: "Login", layout: "blank-layout" });
};

//todo implement
Controller.register = (req, res) => {
  res.render("register", { title: "Express" });
};

Controller.logout = (req, res) => {
  req.logout();
  res.redirect("/login");
};

module.exports = Controller;
