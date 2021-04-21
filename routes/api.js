const express = require("express");
const router = express.Router();
const articlesController = require("../controllers/articles.controller");
const usersController = require("../controllers/users.controller");
const churchesController = require("../controllers/church.controller");
const churchContentController = require("../controllers/churchcontent.controller");
const eventsController = require("../controllers/events.controller");
const donationController = require("../controllers/donation.controller");

/*****Api routes*********************/
router.post("/users/register", usersController.registerUser);
//for the home page pull daily devotional, featured audio and featured videos
router.post("/users/login", usersController.login);
router.post("/users/forgotten_password", usersController.resetPassword);
router.post("/articles", articlesController.articles); //todo : this is just an example of how the routes should be done
router.get("/churches", churchesController.getChurches);
router.post("/search/churchcontent", churchContentController.searchChurchContent);
router.get("/getmyplaylist", churchContentController.searchChurchContent); //add the jwt middleware to identify the user
router.get("/getupcomingevents", eventsController.getUpcomingEvents); //add the jwt middleware to identify the user
router.post("/bookappointment", churchesController.bookAppointment); //add the jwt middleware to identify the user
router.post("/getavailabletimesbydate", churchesController.getAvailableAppointmentTimes); //add the jwt middleware to identify the user


router.get("/getdonationtypes", donationController.getChurchDonationTypes); //add the jwt middleware to identify the user
router.post("/makedonation", donationController.makeDonation); //add the jwt middleware to identify the user
router.get("/donationhistory", donationController.donationHistory); //add the jwt middleware to identify the user


//Todo return church contact info on login

module.exports = router;
