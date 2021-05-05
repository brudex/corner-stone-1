const express = require("express");
const router = express.Router();
//Controllers
const usersController = require("../controllers/users.controller");
const churchesController = require("../controllers/church.controller");
const churchContentController = require("../controllers/churchcontent.controller");
const eventsController = require("../controllers/events.controller");
const donationController = require("../controllers/donation.controller");
const appointmentController = require("../controllers/appointment.controller");
const stripeController = require("../controllers/stripe.controller");
//Middlewares
const api_auth = require("../middlewares/api-auth");



/************Account and Registration***********/
router.post("/users/login", usersController.login);
router.post("/users/forgotten_password", usersController.resetPassword);
router.post("/users/register", usersController.registerUser);
//Todo return church contact info on login

router.get("/churches", churchesController.getChurches);
router.get("/church", api_auth, churchesController.getChurch);


/**************Church Content***********/
//for the home page pull daily devotional, featured audio and featured videos
router.get("/featuredContent", api_auth, churchContentController.getFeaturedContent); //For mobile home page
router.get("/churchcontent/search/:id", api_auth, churchContentController.getChurchContentById);
router.get("/churchcontent/search",api_auth,churchContentController.searchChurchContent);
router.get("/churchcontent/dailydevotional",api_auth,  churchContentController.getDailyDevotionals);
router.get("/churchcontent/:contentType",api_auth, churchContentController.getChurchContent); //fetch church content for homepage based on content type
router.post("/churchContent/playlist/add", api_auth, churchContentController.addToUserPlayList); //add the jwt middleware to identify the user
router.get("/getmyplaylist", api_auth, churchContentController.getUserPlayList); //add the jwt middleware to identify the user



/**************Events*************/
router.get("/events", api_auth, eventsController.getUpcomingEvents);
router.get("/getupcomingevents", eventsController.getUpcomingEvents); //add the jwt middleware to identify the user


/************Booking appointment*****/
router.post("/appointment/set", api_auth, appointmentController.setAppointment);
router.post("/bookappointment", churchesController.bookAppointment); //add the jwt middleware to identify the user
router.post("/getavailabletimesbydate",  churchesController.getAvailableAppointmentTimes); //add the jwt middleware to identify the user
router.get("/appointment/:date",  api_auth,appointmentController.getAppointmentTimes);


/*************Donation and Payment Initiation***************/
router.get("/getdonationtypes", donationController.getChurchDonationTypes);
router.get("/donationhistory",api_auth, donationController.donationHistory); //add the jwt middleware to identify the user
router.get("/donationTypes", api_auth,  donationController.getChurchDonationTypes);
router.post("/initiatePaymentIntent", api_auth,stripeController.initiatePaymentIntent); //call this endpoint to state a payment session it will return the url which has the payment form
router.get("/paymentStatus/:pageId", api_auth,stripeController.paymentStatus); //call this endpoint to state a payment session it will return the url which has the payment form
router.post("/users/change_password", api_auth, usersController.changePassword);
//Todo return church contact info on login

module.exports = router;
