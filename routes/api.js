const express = require("express");
const router = express.Router();
//Controllers
const articlesController = require("../controllers/articles.controller");
const usersController = require("../controllers/users.controller");
const churchesController = require("../controllers/church.controller");
const churchContentController = require("../controllers/churchcontent.controller");
const eventsController = require("../controllers/events.controller");
const donationController = require("../controllers/donation.controller");
const appointmentController = require("../controllers/appointment.controller");
//Middlewares
const api_auth = require("../middlewares/api-auth");
/*****Api routes*********************/
//for the home page pull daily devotional, featured audio and featured videos
router.get(
  "/appointment/:date",
  api_auth,
  appointmentController.getAppointmentTimes
);
router.get(
  "/featuredContent",
  api_auth,
  churchContentController.getFeaturedContent
);
router.get("/churches", churchesController.getChurches);
router.get("/church", api_auth, churchesController.getChurch);
router.get(
  "/churchcontent/search/:id",
  api_auth,
  churchContentController.getChurchContentById
);
router.get(
  "/churchcontent/search",
  api_auth,
  churchContentController.searchChurchContent
);
router.get(
  "/churchcontent/dailydevotional",
  api_auth,
  churchContentController.getDailyDevotionals
);
router.get(
  "/churchcontent/:contentType",
  api_auth,
  churchContentController.getChurchContent
); //fetch church content for homepage based on content type
router.get("/events", api_auth, eventsController.getUpcomingEvents);
router.get("/getmyplaylist", api_auth, churchContentController.getUserPlayList); //add the jwt middleware to identify the user
router.get("/getupcomingevents", eventsController.getUpcomingEvents); //add the jwt middleware to identify the user
router.get("/getdonationtypes", donationController.getChurchDonationTypes); //add the jwt middleware to identify the user
router.get("/donationhistory", donationController.donationHistory); //add the jwt middleware to identify the user

router.get(
  "/donationTypes",
  api_auth,
  donationController.getChurchDonationTypes
);
router.post("/appointment/set", api_auth, appointmentController.setAppointment);
router.post(
  "/churchContent/playlist/add",
  api_auth,
  churchContentController.addToUserPlayList
); //add the jwt middleware to identify the user
router.post("/bookappointment", churchesController.bookAppointment); //add the jwt middleware to identify the user
router.post(
  "/getavailabletimesbydate",
  api_auth,
  churchesController.getAvailableAppointmentTimes
); //add the jwt middleware to identify the user

router.post("/makedonation", api_auth, donationController.makeDonation); //add the jwt middleware to identify the user
router.post("/users/login", usersController.login);
router.post("/users/forgotten_password", usersController.resetPassword);
router.post("/articles", articlesController.articles); //todo : this is just an example of how the routes should be done
router.post("/users/register", usersController.registerUser);
router.post("/users/change_password", api_auth, usersController.changePassword);
//Todo return church contact info on login

module.exports = router;
