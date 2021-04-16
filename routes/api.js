const express = require('express');
const router = express.Router();
const articlesController = require('../controllers/articles.controller');

/*****Api routes*********************/
router.post('/articles', articlesController.articles); //todo : this is just an example of how the routes should be done
router.get('/editablebiodata/:barCode', articlesController.articles); //Note : don't write implementation code here just routes

module.exports = router;
