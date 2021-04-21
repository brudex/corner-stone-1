const express = require("express");
const router = express.Router();
const db = require("../models");
const dateFns = require("date-fns");
const _ = require("lodash");

const Controller = {};
module.exports = Controller;

Controller.searchChurchContent = (req, res) => {
  //req.body = {searchText:"daily devotional"}

  //get the users church and search in that church
  //Query church content and return the results
  res.json({status:"00",data:[{title:"",contentType:"devotional",contentText:"Jesus is Lord"}]}); ///data is array of search results
};


Controller.getChurchContentById = (req, res) => {
  //req.body = {searchText:"daily devotional"}
  //get the users church and search in that church
  //Query church content and return the results
  res.json({status:"00",data:[{}]}); ///data is array of search results
};

Controller.getMyPlayList = (req, res) => {
  //return the user's playlist
  res.json({status:"00",data:[{}]}); ///data is array of search results
};

