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
const notificationsController = require("../controllers/notifications.controller");
//Middlewares
const api_auth = require("../middlewares/api-auth");
const admin = require("../middlewares/admin");
const auth = require("../middlewares/auth");

/************Account and Registration***********/
router.post("/users/login", usersController.login);
router.post("/users/forgotten_password", usersController.resetPassword);
router.post("/users/register", usersController.registerUser);
//Todo return church contact info on login

router.get("/churches", churchesController.getChurches);
router.get("/church", api_auth, churchesController.getChurch);

/**************Church Content***********/
//for the home page pull daily devotional, featured audio and featured videos
router.get(
  "/featuredContent",
  api_auth,
  churchContentController.getFeaturedContent
); //For mobile home page
router.get(
  "/churchcontent/recent",
  api_auth,
  churchContentController.getRecentContent
);
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
router.post(
  "/churchContent/playlist/add",
  api_auth,
  churchContentController.addToUserPlayList
); //add the jwt middleware to identify the user
router.post("/sermons/add", [auth, admin], churchContentController.addSermon);
router.post("/videos/add", [auth, admin], churchContentController.addVideo);

/**************Events*************/
router.get("/events", api_auth, eventsController.getUpcomingEvents);
router.get("/getupcomingevents", eventsController.getUpcomingEvents); //add the jwt middleware to identify the user
router.get("/getdonationtypes", donationController.getChurchDonationTypes); //add the jwt middleware to identify the user
router.get("/donationhistory",api_auth, donationController.donationHistory); //add the jwt middleware to identify the user
router.get(
  "/donationTypes",
  api_auth,
  donationController.getChurchDonationTypes
);


/************Booking appointment*****/
// >>>>>>> 833d1541cf19f95336d4e7e992ecfecfc6b99403
router.post("/appointment/set", api_auth, appointmentController.setAppointment);
router.post("/bookappointment", churchesController.bookAppointment); //add the jwt middleware to identify the user
router.post(
  "/getavailabletimesbydate",
  churchesController.getAvailableAppointmentTimes
); //add the jwt middleware to identify the user
router.get(
  "/appointment/:date",
  api_auth,
  appointmentController.getAppointmentTimes
);

/*************Donation and Payment Initiation***************/
router.get(
  "/donations/donationsByMonth",
  [auth, admin],
  donationController.getDonationsByMonth
);
router.get("/getdonationtypes", donationController.getChurchDonationTypes);
router.get("/donationhistory", api_auth, donationController.donationHistory); //add the jwt middleware to identify the user
router.get(
  "/donationTypes",
  api_auth,
  donationController.getChurchDonationTypes
);
router.post(
  "/initiatePaymentIntent",
  api_auth,
  stripeController.initiatePaymentIntent
); //call this endpoint to start a payment session it will return the url which has the payment form
router.get("/paymentStatus/:pageId", stripeController.paymentStatus); //call this endpoint status of payment has the payment form
router.post("/setPaymentStatus/:pageId", stripeController.setPaymentStatus); //set payment status


/*****************Users endpoint*****************/
router.get("/users/getdetails", api_auth, usersController.getUserDetails);
router.get(
  "/users/getprofilepicture",
  api_auth,
  usersController.getUserPicture
);
router.get("/users/getUserplaylist", api_auth, usersController.getUserPlayList);
router.post(
  "/users/upload_profile_picture",
  api_auth,
  usersController.uploadProfilePicture
);
router.post(
  "/users/edit_user_details",
  api_auth,
  usersController.editUserDetails
);
router.post("/users/change_password", api_auth, usersController.changePassword);
//Todo return church contact info on login

/***************** Notifications ********************/

router.get(
  "/notifications/getusernotifications",
  api_auth,
  notificationsController.getUserNotifications
);

module.exports = router;
