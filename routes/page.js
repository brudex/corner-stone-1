const express = require("express");
const router = express.Router();
const passport = require("passport");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");
const superAdmin = require("../middlewares/super-admin");
const indexController = require("../controllers/index.controller");
const accountController = require("../controllers/account.controller");
const churchController = require("../controllers/church.controller");
const usersController = require("../controllers/users.controller");
const churchContentController = require("../controllers/churchcontent.controller");

/*****Page Routes*********************/

router.get("/", [auth, superAdmin], indexController.index);
router.get("/church", [auth, admin], indexController.churchAdminView);
router.get("/403", indexController._403);
router.get("/login", accountController.loginView);
router.get("/register", accountController.register);
router.get("/forgotpassword", accountController.forgotPasswordView);
router.get("/resetpassword/:token", accountController.resetPasswordView);
router.get("/churches", [auth, superAdmin], churchController.churchesView);
router.get("/churches/add", [auth, superAdmin], churchController.addChurchView);
router.get("/churches/delete/:id", churchController.deleteChurch);
router.get("/churches/edit/:id", churchController.editChurchView);
router.get("/users", [auth, superAdmin], usersController.usersView);
router.get("/users/add", [auth, superAdmin], usersController.addUserView);
router.get("/users/edit/:id", [auth, superAdmin], usersController.editUserView);
router.get("/users/delete/:id", [auth, superAdmin], usersController.deleteUser);
router.get("/churchmembers", [auth, admin], usersController.churchMembersView);
router.get("/sermons", [auth, admin], churchContentController.sermonView);
router.get(
  "/devotionals",
  [auth, admin],
  churchContentController.devotionalView
);
router.get(
  "/daily-devotionals",
  [auth, admin],
  churchContentController.dailyDevotionalView
);
router.get(
  "/devotionals/add",
  [auth, admin],
  churchContentController.addDevotionalView
);
router.get(
  "/daily-devotionals/add",
  [auth, admin],
  churchContentController.addDailyDevotionalView
);
router.get(
  "/devotionals/edit/:id",
  [auth, admin],
  churchContentController.editDevotionalView
);
router.get(
  "/daily-devotionals/edit/:id",
  [auth, admin],
  churchContentController.editDailyDevotionalView
);

router.post(
  "/devotionals/add",
  [auth, admin],
  churchContentController.addDevotional
);

router.post(
  "/daily-devotionals/add",
  [auth, admin],
  churchContentController.addDailyDevotional
);
router.post(
  "/devotionals/edit/:id",
  [auth, admin],
  churchContentController.editDevotional
);
router.post(
  "/daily-devotionals/edit/:id",
  [auth, admin],
  churchContentController.editDailyDevotional
);
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
