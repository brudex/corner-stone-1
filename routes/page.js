const express = require('express');
const router = express.Router();
const indexController = require('../controllers/index.controller');
const accountController = require('../controllers/account.controller');

/*****Page Routes*********************/

 router.get('/', indexController.index);
 router.get('/login', accountController.login); //todo implement : Note don't write implmentation code here write it in the controller
 router.get('/register', accountController.register); //todo implement : Note don't write implementation code here write it in the controller

module.exports = router;
