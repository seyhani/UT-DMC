var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var sanitize = require('mongo-sanitize');
var nodemailer = require('nodemailer');
var request = require('request');
var middleware = require('../middleware/index');
var crypto = require("crypto");
var async = require("async");
var SMTPServer = require('smtp-server').SMTPServer;
var simplesmtp = require("simplesmtp");
var fs = require("fs");
var smtpTransport = require('nodemailer-smtp-transport');
var directTransport = require('nodemailer-direct-transport');
'use strict';

// router.all("/admin/*",middleware.isLoggedIn,middleware.havePermission);

router.get("/", function(req, res){
    req.flash("info","dsdadasdasdasdsd");
    res.render('landing', { messages: req.flash('info') });
});

// show register form
router.get("/register", function(req, res){
   res.render("register"); 
});

router.post('/register',function(req, res,next) {
    var username = sanitize(req.body.username);
    var password = sanitize(req.body.password);
    var firstname = sanitize(req.body.firstname);
    var lastname = sanitize(req.body.lastname);
    var studentId = sanitize(req.body.studentId);
    var email = sanitize(req.body.email);
    var user = new User({
        firstname: firstname,
        lastname: lastname,
        username: username,
        studentId: studentId,
        email: email,
        password: password,
    });
    User.findOne({username: user.username}).exec(function (err, existUser) {
        if (err) return next(err);
        if (existUser) {
            req.flash('error', 'Username already exist');
            res.redirect('/register');
        } else {
            user.save(function (err) {
                req.logIn(user, function (err) {
                    res.redirect('/dashboard');
                });
            });
        }
    });
});
//show login form
router.get("/login", function(req, res){
   res.render("login"); 
});

router.post('/login', function(req, res, next) {
    var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret="+ '6LdbUwcUAAAAAMquB_XKPwD5XtUPwhY19iIU8umM' +"&response=" +req.body['g-recaptcha-response'];
    request(verificationUrl,function(error,response,body) {
        
        // if(body.success)
        if(true)
        {
            passport.authenticate('local', function(err, user, info) {
                if (err) return next(err);
                if (!user) {
                    return res.redirect('/login')
                }
                req.logIn(user, function(err) {
                    if (err) return next(err);
                    return res.redirect('/dashboard');
                });
            })(req, res, next);
        }else{
            res.redirect('/login');
        }

    });
});

// logout route
router.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "LOGGED YOU OUT!");
   res.redirect("/");
});

router.get('/forgot', function(req, res,next) {
    res.render('forgot_password', {user: req.user});
});

router.post('/forgot', function(req, res, next) {
    var usr;
    async.waterfall([
        function(done) {
            crypto.randomBytes(24, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            User.findOne({ username: req.body.username}, function(err, user) {
                if(err) return next(err);
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/forgot');
                }
                usr = user;
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                // var server  = emailjs.server.connect(require('../config/mailserver'));
                // server.send({
                //     text: 'http://' + req.headers.host + '/reset/' + token   ,
                //     from:    "you <ahsprim@gmail.com>",
                //     to:      "you <ahsprim@gmail.com>",
                //     subject: "Proff Reset Password"
                // }, function(err, message) { console.log(err || message); });
                user.save(function(err) {
                    console.log('http://' + req.headers.host + '/reset/' + token);
                    done(err, token, user);
                });
            });
        },
    ], function(err) {
        if (err) return next(err);
        res.redirect('/');
    });
});

router.get('/reset/:token', function(req, res,next) {
    User.findOne({ resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    }
        , function(err, user) {
        if(err) return next(err);
        if (!user) {
            // req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        } else{
            res.render('reset_password', {user:user});
        }
    });
});

router.post('/reset/:token', function(req, res,next) {
    async.waterfall([
        function(done) {
            User.findOne({$and:[{resetPasswordToken: req.params.token},{resetPasswordExpires: { $gt: Date.now() }} ]},
                function(err, user) {
                    if (!user) {
                        req.flash('error', 'Password reset token is invalid or has expired.');
                        return res.redirect('back');
                    }
    
                    user.password = req.body.password;
                    user.resetPasswordToken = undefined;
                    user.resetPasswordExpires = undefined;
    
                    user.save(function(err) {
                    req.logIn(user, function(err) {
                        req.flash('success', 'Success! Your password has been changed.');
                        done(err, user);
                    });
                });
            });
        },
    ], function(err) {
        res.redirect('/login');
    });
});

module.exports = router;