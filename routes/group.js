var express = require("express");
var router  = express.Router();
var passport = require("passport");
var Group = require("../models/group");
var User = require("../models/user");
var middleware = require("../middleware/index");
//root route
router.get("/join",middleware.isLoggedIn, function(req, res){
    res.render("groups/new");
});

router.get("/groups/:groupId", function(req, res){
    Group.findById(req.params.groupId).populate('members').exec(function (err,group) {
        res.render("admin/groups/show",{group:group});
    });
});

router.post("/groups/new",middleware.isLoggedIn, function(req, res){
    var newGroup = new Group({name:req.body.groupName});
    Group.create(newGroup,function (err,group) {
        if(err)
            console.log(err);
        req.user.group = group;
        req.user.save();
    });
    res.redirect('/');
});

router.post("/groups/join/:groupId/:membershipToken",middleware.isLoggedIn, function(req, res){
    Group.findById(req.params.groupId).exec(function (err,group) {
        if(req.params.membershipToken == group.membershipToken) {
            group.addMember(req.user);
        }
        res.redirect('/');
    });
});

module.exports = router;