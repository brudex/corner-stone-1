const express = require("express");
const router = express.Router();
const passport = require("passport");
const auth = require("../middlewares/auth");
const superAdmin = require("../middlewares/super-admin");
const indexController = require("../controllers/index.controller");
const accountController = require("../controllers/account.controller");
const churchController = require("../controllers/church.controller");
const usersController = require("../controllers/users.controller");

/*****Page Routes*********************/

router.get("/", auth, indexController.index);
router.get("/403", indexController._403);
router.get("/login", accountController.loginView);
router.get("/register", accountController.register);
router.get("/forgotpassword", accountController.forgotPasswordView);
router.get("/resetpassword/:token", accountController.resetPasswordView);
router.get("/churches", auth, churchController.churchesView);
router.get("/churches/add", auth, churchController.addChurchView);
router.get("/churches/delete/:id", churchController.deleteChurch);
router.get("/churches/edit/:id", churchController.editChurchView);
router.get("/users", usersController.usersView);
router.get("/users/add", usersController.addUserView);
router.get("/users/edit/:id", usersController.editUserView);
router.get("/users/delete/:id", usersController.deleteUser);

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);
router.post("/users/add", usersController.addUser);
router.post("/users/edit/:id", usersController.editUser);
router.post("/logout", accountController.logout);
router.post("/forgotpassword", accountController.forgotPassword);
router.post("/resetpassword", accountController.resetPassword);
router.post("/addchurch", auth, churchController.addChurch);
router.post("/churches/edit/:id", churchController.editChurch);
router.post("/churches/edit/image/:id", churchController.editChurchImage);

module.exports = router;
