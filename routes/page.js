const express = require("express");
const router = express.Router();
const passport = require("passport");
const auth = require("../middlewares/auth");
const indexController = require("../controllers/index.controller");
const accountController = require("../controllers/account.controller");
const churchController = require("../controllers/church.controller");

/*****Page Routes*********************/

router.get("/", auth, indexController.index);
router.get("/login", accountController.loginView);
router.get("/register", accountController.register);
router.get("/forgotpassword", accountController.forgotPasswordView);
router.get("/resetpassword/:token", accountController.resetPasswordView);
router.get("/addchurch", auth, churchController.addChurchView);

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);
router.post("/logout", accountController.logout);
router.post("/forgotpassword", accountController.forgotPassword);
router.post("/resetpassword", accountController.resetPassword);
router.post("/addchurch", auth, churchController.addChurch);

module.exports = router;
