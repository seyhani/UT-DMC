var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Group = require("../models/group");

router.get("/", function(req, res){
    res.render('admin/index');
});

router.get("/groups", function(req, res){
    Group.find({}).exec(function (err,groups) {
        res.render("admin/groups/index",{groups:groups});
    });
});

router.get("/groups/new", function(req, res){
    res.render("admin/groups/new");
});

router.post("/groups", function(req, res){
    Group.create({name:req.body.groupName},function (err,group) {
        console.log(group);
       res.redirect('groups/'+group._id);
    });
});

router.post("/groups/:groupId/addUser", function(req, res){
    Group.findById(req.params.groupId,function (err,group) {
        User.findOne({username:req.body.username}).exec(function (err,user) {
            if(user) {
                group.addMember(user);
            } else {
                req.flash('error','User Not Found');
            }
        });
        res.redirect('/admin/groups/'+group._id);
    });
});

router.get("/groups/:groupId", function(req, res){
    Group.findById(req.params.groupId).populate(['members','competition.solvedProblems']).exec(function (err,group) {
        User.find({_id:{$nin:group.members}}).exec(function (err,users) {
            res.render("admin/groups/show",{group:group,users:users});
        });
    });
});

router.delete("/groups/:groupId", function(req, res){
    Group.findById(req.params.groupId).exec(function (err,group) {
        group.remove();
        res.redirect('/admin/groups');
    });
});

router.get("/users", function(req, res){
    User.find({}).exec(function (err,users) {
        res.render("admin/users/index",{users:users});
    });
});

router.get("/users/new", function(req, res){
    res.render("admin/users/new");
});

router.post("/users", function(req, res){
    User.create({name:req.body.userName},function (err,user) {
        console.log(user);
        res.redirect('users/'+user._id);
    });
});

router.post("/users/:userId/addUser", function(req, res){
    User.findById(req.params.userId,function (err,user) {
        User.findOne({username:req.body.username}).exec(function (err,user) {
            if(user) {
                user.addMember(user);
            } else {
                req.flash('error','User Not Found');
            }
        });
        res.redirect('/admin/users/'+user._id);
    });
});

router.get("/users/:userId", function(req, res){
    User.findById(req.params.userId).populate('group').exec(function (err,user) {
        res.render("admin/users/show",{user:user});
    });
});

router.delete("/users/:userId", function(req, res){
    User.findById(req.params.userId).exec(function (err,user) {
        user.remove();
        res.redirect('/admin/users');
    });
});

module.exports = router;