var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Problem = require("../models/problem");
var Puzzle = require("../models/puzzle");
var Group = require("../models/group");

router.get("/", function(req, res){
    res.render('admin/index');
});

module.exports = router;