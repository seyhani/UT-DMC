var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Problem = require("../models/problem");
var Puzzle = require("../models/puzzle");
var Group = require("../models/group");

router.get("/", function(req, res){
    User.find({}).exec(function (err,users) {
        res.render("admin/users/index",{users:users});
    });
});

router.get("/new", function(req, res){
    res.render("admin/users/new");
});

router.post("/", function(req, res){
    User.create({name:req.body.userName},function (err,user) {
        console.log(user);
        res.redirect('users/'+user._id);
    });
});

router.post("/:userId/addUser", function(req, res){
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

router.get("/:userId", function(req, res){
    User.findById(req.params.userId).populate('group').exec(function (err,user) {
        res.render("admin/users/show",{user:user});
    });
});

router.delete("/:userId", function(req, res){
    User.findById(req.params.userId).exec(function (err,user) {
        user.remove();
        res.redirect('/admin/users');
    });
});

module.exports = router;