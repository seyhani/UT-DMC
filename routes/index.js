var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Puzzle = require("../models/puzzle");
var sanitize = require('mongo-sanitize');
var nodemailer = require('nodemailer');
var request = require('request');
var middleware = require('../middleware/index');
var cookie = require('../middleware/cookie');
var mailer = require('../middleware/mailSender');
var normalizeEmail = require('../middleware/emailNormalizer');
var Group = require("../models/group");
var token = require('../middleware/token');
var crypto = require("crypto");
const mailTemplates = 'middleware/mailTemplates/';
var async = require("async");
var simplesmtp = require("simplesmtp");
var fs = require("fs");
var Rule = require("../models/rule");
'use strict';

// var host = "http://acm.ut.ac.ir/dmc";
// var baseURL = "/dmc";

// router.all("/admin/*",middleware.isLoggedIn,middleware.havePermission);
router.all("*",function (req, res, next) {
    res.cookie("path",req.path);
    res.cookie("lastPath",req.cookies.path);
    next();
});
router.get("/back", function(req, res){
    var redirect;
    console.log(req.path);
    if(!req.cookies || !req.cookies.lastPath)
        redirect = req.path.substring(0,req.path.lastIndexOf("/"));
    else
        redirect = req.cookies.lastPath;
    middleware.dmcRedirect(res, redirect);
});
router.get("/", function(req, res){

    Rule.findOne({name:"DMC"}).exec(function (err,rule) {
        var time;
        if(Date.now() < rule.startDate)
            time = rule.startDate - Date.now();
        else if(Date.now() - rule.startDate < rule.duration)
            time = rule.startDate - Date.now() + rule.duration;
        else
            time = 0;
        res.render("landing", {time: time, currentUser: req.user});
    });
});

router.get("/ranking", function(req, res){
    Group.find({}).populate("competition").sort({"competition.stage": -1}).limit(20).exec(function (err,groups) {
        Puzzle.find().populate("problem").exec(function (err,puzzles) {
            groups.forEach(function (group) {
                puzzles.forEach(function (puzzle) {
                    if((group.competition.puzzles.indexOf(puzzle._id)!=-1)&&puzzle.accepted)
                        group.competition.score += puzzle.score;

                });
                group.competition.save();
                group.save();
            });
            res.render("dashboard/ranking",{groups:groups,currentUser:req.user});
        });
    });
});

// show register form
router.get("/register", function(req, res){
    res.render("register", {currentUser: req.user});
});

router.post('/register',function(req, res,next) {
    var username = sanitize(req.body.username);
    var password = sanitize(req.body.password);
    var firstname = sanitize(req.body.firstname);
    var lastname = sanitize(req.body.lastname);
    var studentId = sanitize(req.body.studentId);
    var email = sanitize(req.body.email);
    var user = {
        firstname: firstname,
        lastname: lastname,
        username: username,
        studentId: studentId,
        email: email,
        password: password,
    };
    User.findOne({$or:[{username: user.username},{studentId:studentId}]}).exec(function (err, existUser) {
        console.log(existUser);
        if (err) return next(err);
        if (existUser) {
            req.flash('error', 'Username already exist!');
            middleware.dmcRedirect(res,'/register');
        } else {
            // mailer.sendTemplateTo(mailTemplates+"verification",{address:host,link:host+"/register/"+ token.setToken(user), name: firstname}
            //     ,user.username,function (err,info)
            console.log(user);
            console.log(host+"/register/"+token.setToken(user));
            req.flash("success", "برای تأیید ایمیل، به ایمیل خود مراجعه کنید.");
            middleware.dmcRedirect(res,'/');
            // });
        }
    });
});

router.get('/register/:verification_token',function(req, res,next) {
    var user;
    try {
        user = token.decodeToken(req.params.verification_token);
        console.log(user);
        User.findOne({username:user.username}).exec(function (err,foundUser) {
            if(foundUser) {
                req.flash("error", "لینک ثبت‌نام قبلاً استفاده شده است.");
                middleware.dmcRedirect(res,'/login');
            } else {
                User.create(user,function (err, newUser) {
                    console.log(err);
                    if (err) return next(err);
                    middleware.dmcRedirect(res,'/login');
                });
            }
        });
    }catch(err) {
        req.flash("error", "لینک نامعتبر");
        middleware.dmcRedirect(res,'/');
    }
});
//show login form
router.get("/login", function(req, res){
    res.render("login", {currentUser: req.user});
});

router.post('/login', function(req, res, next){
    passport.authenticate('local', function(err, user, info) {
        if (err) return next(err);
        if (!user) {
            req.flash("error","نام کاربری موجود نیست!");
            return middleware.dmcRedirect(res,'/login');
        }
        req.logIn(user, function(err) {
            if (err) return next(err);
            req.user = null;
            return middleware.dmcRedirect(res, "/dashboard/");
        });
    })(req, res, next);
});


router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "شما از سایت خارج شدید!");
    middleware.dmcRedirect(res,"");
});

router.get('/forgot', function(req, res,next) {
    res.render('forgot_password', {user: req.user, currentUser: req.user});
});

router.post('/forgot', function(req, res, next) {
    User.findOne({ username: req.body.username}, function(err, user) {
        if(!user){
            req.flash("error","Username doesnt exist!")
            middleware.dmcRedirect(res,'/forgot');
        }
        else{
            user.token = token.generateToken(50);
            user.tokenExpires = Date.now() + 3600*60;
            user.save();
            mailer.sendTemplateTo(mailTemplates+"resetpass",{address:host,link:host+"/reset/"+ user.token, name: user.firstname},user.username,function (err,info) {
                console.log(info);
                console.log(err);
                console.log(host+"/reset/"+user.token);
                req.flash("success", "به ایمیل خود مراجعه کنید.");
                middleware.dmcRedirect(res,'');
            });
        }
    });
});

router.get('/reset/:token', function(req, res,next) {
    User.findOne({ token:req.params.token}
        , function(err, user) {
            if(err) return next(err);
            if (!user) {
                req.flash('error', 'لینک تغییر رمزعبور شما باطل شده یا نا متعبر است.');
                return middleware.dmcRedirect(res,'/forgot');
            } else{
                res.render('reset_password', {user:user,token:req.params.token, currentUser: req.user});
            }
        });
});

router.post('/reset/:token', function(req, res,next) {
    // ,{resetPasswordExpires: { $gt: Date.now() }} ]
    async.waterfall([
        function(done) {
            User.findOne({ token:req.params.token},
                function(err, user) {
                    if (!user) {
                        req.flash('error', 'لینک تغییر رمزعبور شما باطل شده یا نا متعبر است.');
                        return middleware.dmcRedirect(res,'back');
                    }
                    user.password = req.body.password;
                    user.token = undefined;
                    user.tokenExpires = undefined;
                    user.save(function(err) {
                        req.logIn(user, function(err) {
                            req.flash('success', 'رمزعبور شما با موفقیت تغییر کرد.');
                            done(err, user);
                        });
                    });
                });
        },
    ], function(err) {
        middleware.dmcRedirect(res,'/login');
    });
});

router.get("/about", function(req, res) {
    res.render('about', {currentUser: req.user});
});

router.get("/puzzles/:puzzle_id/status", function(req, res){
    console.log(req.params.puzzle_id);
    Puzzle.findById(req.params.puzzle_id).exec( function (err, puzzle) {
        if(puzzle)
            return res.json({status:puzzle.status});
        else
            return res.json({status:null});
    });
});

module.exports = router;
