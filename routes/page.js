const express = require("express");
const router = express.Router();
const passport = require("passport");
const auth = require("../middlewares/auth");
const indexController = require("../controllers/index.controller");
const accountController = require("../controllers/account.controller");

/*****Page Routes*********************/

router.get("/", auth, indexController.index);
router.get("/login", accountController.loginView);
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);
router.post("/logout", accountController.logout);
router.get("/register", accountController.register); //todo implement : Note don't write implementation code here write it in the controller

module.exports = router;
