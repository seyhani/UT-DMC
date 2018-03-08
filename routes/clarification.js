var express = require("express");
var router  = express.Router();
var Problem = require("../models/problem");
var Tag = require("../models/tag");
var Group = require("../models/group");
var Puzzle = require("../models/puzzle");
var User = require("../models/user");
var middleware = require("../middleware");
var request = require("request");
var multer = require('multer');
var rimraf = require('rimraf');
var fs = require("fs");
var upload = multer({
    dest: './Uploads/',
    onFileUploadComplete: function (file) {
        console.log(file.fieldname + ' uploaded to  ' + file.path)
    }
});
var sanitize = require('mongo-sanitize');
var path = require('path');

router.get("/", function(req, res){

});


module.exports = router;
