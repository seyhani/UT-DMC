var express = require("express");
var router  = express.Router();
var _ = require("lodash");

router.get("/", function(req, res){
    res.render('admin/index');
});


module.exports = router;