const express = require("express");
const router = express.Router();
const articlesController = require("../controllers/articles.controller");
const usersController = require("../controllers/users.controller");
const churchesController = require("../controllers/church.controller");

/*****Api routes*********************/
router.post("/users/register", usersController.registerUser);
router.post("/users/login", usersController.login);
router.post("/users/forgotten_password", usersController.forgottenPassword);
router.post("/articles", articlesController.articles); //todo : this is just an example of how the routes should be done
router.get("/churches", churchesController.getChurches);
router.get("/editablebiodata/:barCode", articlesController.articles); //Note : don't write implementation code here just routes

module.exports = router;
