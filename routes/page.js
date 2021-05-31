const express = require("express");
const router = express.Router();
const passport = require("passport");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");
const superAdmin = require("../middlewares/super-admin");
const indexController = require("../controllers/index.controller");
const accountController = require("../controllers/account.controller");
const stripeController = require("../controllers/stripe.controller");
const churchController = require("../controllers/church.controller");
const usersController = require("../controllers/users.controller");
const eventsController = require("../controllers/events.controller");
const churchContentController = require("../controllers/churchcontent.controller");
const donationController = require("../controllers/donation.controller");
const appointmentController = require("../controllers/appointment.controller");
const notificationsController = require("../controllers/notifications.controller");

/*****Page Routes*********************/

router.get("/", [auth, superAdmin], indexController.index);
router.get("/church", [auth, admin], indexController.churchAdminView);
router.get("/403", indexController._403);
router.get("/login", accountController.loginView);
router.get("/register", accountController.register);
router.get("/forgotpassword", accountController.forgotPasswordView);
router.get("/resetpassword/:token", accountController.resetPasswordView);
router.get("/logout", accountController.logout);
router.get(
  "/account/change-password",
  [auth, admin],
  accountController.changePasswordView
);
router.get(
  "/account/edit-account",
  [auth, admin],
  accountController.editAccountView
);
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
  "/sermons/add",
  [auth, admin],
  churchContentController.addSermonView
);
router.get(
  "/sermons/delete/:id",
  [auth, admin],
  churchContentController.deleteSermon
);
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
  "/livestream",
  [auth, admin],
  churchContentController.livestreamView
);
router.get(
  "/livestream/add",
  [auth, admin],
  churchContentController.addLiveStreamView
);
router.get(
  "/livestream/edit/:id",
  [auth, admin],
  churchContentController.editLiveStreamView
);
router.get(
  "/livestream/delete/:id",
  [auth, admin],
  churchContentController.deleteLiveStream
);
router.get(
  "/daily-devotionals/edit/:id",
  [auth, admin],
  churchContentController.editDailyDevotionalView
);
router.get("/videos/add", [auth, admin], churchContentController.addVideoView);
router.get(
  "/videos/delete/:id",
  [auth, admin],
  churchContentController.deleteVideo
);
router.get("/donations", [auth, admin], donationController.getDonationsView);
router.get("/events", [auth, admin], eventsController.getUpcomingEventsView);
router.get("/events/add", [auth, admin], eventsController.addEventView);
router.get("/events/edit/:id", [auth, admin], eventsController.editEventView);
router.get("/events/delete/:id", [auth, admin], eventsController.deleteEvent);
router.get("/donations", [auth, admin], donationController.getDonationsView);
router.get(
  "/donationsByChurch",
  [auth, superAdmin],
  donationController.getDonationsByChurchView
);
router.get(
  "/donations/pending-settlements",
  [auth, admin],
  donationController.pendingSettlements
);
router.get(
  "/donations/completed-settlements",
  [auth, admin],
  donationController.completedSettlements
);
router.get(
  "/donations/types",
  [auth, admin],
  donationController.donationTypesView
);
router.get(
  "/appointments",
  [auth, admin],
  appointmentController.appointmentsView
);
router.get(
  "/appointments/available-dates",
  [auth, admin],
  appointmentController.availableAppointmentsView
);
router.get(
  "/appointments/add-appointment-date",
  [auth, admin],
  appointmentController.addAppointmentDateView
);
router.get(
  "/appointments/recurring-appointment",
  [auth, admin],
  appointmentController.recurringAppointmentsView
);
router.get(
  "/appointments/set-recurring-appointment",
  [auth, admin],
  appointmentController.setRecurringAppointmentView
);
router.get("/videos", [auth, admin], churchContentController.videosView);
router.post(
  "/appointments/add-appointment-date",
  [auth, admin],
  appointmentController.addAppointmentDate
);

router.post(
  "/account/edit-account",
  [auth, admin],
  accountController.editAccount
);
router.post(
  "/account/change-password",
  [auth, admin],
  accountController.changePassword
);
router.post(
  "/donations/add",
  [auth, admin],
  donationController.addDonationType
);
router.post(
  "/donations/edit/:id",
  [auth, admin],
  donationController.editDonationType
);
router.post(
  "/donations/setSettlementStatus",
  [auth, superAdmin],
  donationController.setSettlementStatus
);
router.post("/events/add", [auth, admin], eventsController.addEvent);
router.post("/events/edit/:id", [auth, admin], eventsController.editEvent);
router.post(
  "/events/edit/image/:id",
  [auth, admin],
  eventsController.editEventImage
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
  "/livestream/add",
  [auth, admin],
  churchContentController.addLiveStream
);
router.post(
  "/livestream/edit/:id",
  [auth, admin],
  churchContentController.editLiveStream
);
router.post(
  "/livestream/edit/image/:id",
  [auth, admin],
  churchContentController.editLiveStreamImage
);
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);
router.post("/users/add", [auth, superAdmin], usersController.addUser);
router.post("/users/edit/:id", [auth, superAdmin], usersController.editUser);
router.post("/forgotpassword", accountController.forgotPassword);
router.post("/resetpassword", accountController.resetPassword);
router.post("/addchurch", [auth, superAdmin], churchController.addChurch);
router.post(
  "/churches/edit/:id",
  [auth, superAdmin],
  churchController.editChurch
);
router.post(
  "/churches/edit/image/:id",
  [auth, superAdmin],
  churchController.editChurchImage
);

/***************Payment Url*****************/
router.get("/paymentPage/:pageId", stripeController.paymentPage);
router.get("/paymentResult/:status", stripeController.paymentResult);

/************* Push Notification */
router.get(
  "/notifications/super-admin",
  [auth, superAdmin],
  notificationsController.getAllNotificationsHistory
);
router.get(
  "/notifications/church",
  [auth, admin],
  notificationsController.getChurchNotificationsHistory
);
router.get(
  "/notifications/send-notification",
  [auth, admin],
  notificationsController.sendNotificationView
);
router.post(
  "/notifications/send-by-church",
  [auth, admin],
  notificationsController.sendNotifications
);
router.post(
  "/notifications/send-by-superadmin",
  [auth, superAdmin],
  notificationsController.superAdminSendNotifications
);
module.exports = router;
