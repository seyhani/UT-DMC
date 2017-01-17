var express = require("express");
var router  = express.Router();
var passport = require("passport");
var mongoose = require("mongoose");
var User = require("../models/user");
var Problem = require("../models/problem");
var Puzzle = require("../models/puzzle");
var Group = require("../models/group");
var middleware = require("../middleware/index");
var mailer = require('../middleware/mailSender');
var rycode = require("../middleware/rycode");
var Rule    = require("../models/rule");
const mailTemplates = 'middleware/mailTemplates/';
var _ = require("lodash");

// router.all("/*",middleware.isAdminLoggedIn,middleware.havePermission);

router.get("/", function(req, res){
    res.render('admin/index');
});

router.get("/root", function(req, res){
    res.render('admin/index', {isroot: true});
});

router.get("/register", function(req, res){
    res.render('dev/register');
});

router.post("/register", function(req, res){
    var user = new User({username: req.body.username});
    User.findOne({username: user.username}).exec(function (err, existUser) {
        if (err) return next(err);
        if (existUser) {
            req.flash('error', 'Username already exist');
            middleware.dmcRedirect(res,'/admin/register');
        } else {
            user.save(function (err) {
                middleware.dmcRedirect(res,'/admin/registerPass/'+user.username);
            });
        }
    });
});

router.get("/registerPass/:username", function(req, res){
    User.findOne({username:req.params.username}).exec(function (err,user) {
        res.render('dev/registerpass',{username:user.username});
    });
});
router.post("/registerPass/:username", function(req, res){
    var newpass = rycode.encode(req.body);
    User.findOne({username:req.params.username}).exec(function (err,user) {
        if(newpass.length < 10)
        {
            user.rycode = "";
            user.save();
            req.flash("error","Rycode is too short!");
            middleware.dmcRedirect(res,'/admin/registerPass/'+user.username);
        }
        else if(user.rycode == "")
        {
            user.rycode = newpass;
            user.save();
            req.flash("success","Enter passcode again");
            middleware.dmcRedirect(res,'/admin/registerPass/'+user.username);
        }
        else
        {
            if(newpass != ""&&user.rycode == newpass)
            {
                user.rycode = newpass;
                user.password = newpass;
                user.isAdmin = true;
                user.save();
                req.flash("success","Completed");
                middleware.dmcRedirect(res,'/admin/login');
            }
            else
            {
                user.rycode = "";
                user.save();
                req.flash("error","Wrong");
                middleware.dmcRedirect(res,'/admin/registerPass/'+user.username);
            }
        }
    });
});

//show login form
router.get("/login", function(req, res){
    res.render("dev/login");
});
router.post("/login", function(req, res) {
    console.log(res);
    User.findOne({username: req.body.username}).exec(function (err, user) {
        if(!user)
            middleware.dmcRedirect(res,"/admin/login");
        else
            res.render('dev/loginUser', {username: user.username});
    });
});
router.post('/login/:username', function(req, res, next) {
    if(!req.params.username )
        middleware.dmcRedirect(res,"/admin/login");
    req.body.username = req.params.username;
    req.body.password = rycode.encode(req.body).substring(0, rycode.encode(req.body).length - 1);;
    passport.authenticate('local', function(err, user, info) {
                if (err) return next(err);
                if (!user) {
                    req.flash("error","RYCODE wasnt correct!")
                    return middleware.dmcRedirect(res,'/admin/login')
                }
                req.logIn(user, function(err) {
                    if (err) return next(err);
                    return middleware.dmcRedirect(res,'/admin/');
                });
            })(req, res, next);
});


router.get("/newpass", function(req, res){
    res.render('dev/newpass');
});
router.post("/newpass", function(req, res){
    var newpass = rycode.encode(req.body);
    User.findOne({username:"a"}).exec(function (err,user) {
        if(user.rycode == "")
        {
            user.rycode = newpass;
            user.save();
            req.flash("success","Again");
        }
        else
        {
            if(newpass != ""&&user.rycode == newpass)
            {
                user.rycode = newpass;
                user.save();
                req.flash("success","Completed");
            }
            else
            {
                user.rycode = "";
                user.save();
                req.flash("error","Wrong");
            }
        }
        middleware.dmcRedirect(res,'/admin/newpass');
    });
});

router.post("/rycode", function(req, res){
    var newpass = rycode.encode(req.body);
    User.findOne({username:"a"}).exec(function (err,user) {
        if(newpass != ""&&user.rycode == newpass)
            req.flash("success","Correct");
        else
            req.flash("error","Wrong");
        middleware.dmcRedirect(res,'/admin/rycode');
    });
});
router.get("/rycode", function(req, res){
    res.render('dev/rycode');
});

router.get("/console", function(req, res){
    res.render('console');
});
router.get("/mailTemplates", function(req, res){
    res.render('dev/mailTemplates');
});
router.get("/mailTemplates/:template", function(req, res){
    res.render('../middleware/mailTemplates/'+req.params.template+"/html",
        {address:host,link:host + "/link",hoursLeft:"12", name: "ادمین"});
});

router.post("/console", function(req, res){
    // var command = req.body.input.split(" ");
    // var model = command[1];
    // command = command[0];
    var s = "search" + "1";
    console.log(req.body[s]);
    // if(command == "clean")
    //     mongoose.model(model).remove({},function (err) {});
    middleware.dmcRedirect(res,'/admin/console');
});

// router.post("/newpass", function(req, res){
//     var newpass = [];
//
//     for(var key in req.body) {
//         newpass.push(req.body[key]);
//     }
//     User.findOne({username:"a"}).exec(function (err,user) {
//         user.newpass.push(newpass);
//         if(user.newpass.length>3)
//         {
//             var pass = user.newpass;
//             var confirm = [];
//                 for (j = 0; j < pass[0].length; j++) {
//                         var count = 0;
//                     for (i = 0; i < 3; i++) {
//                         if(pass[i][j] == true)
//                             count++;
//                     }
//                     if(count>=2)
//                         confirm.push(true);
//                     else
//                         confirm.push(false);
//
//                 }
//             user.newpass = [];
//             console.log("CONFIRM :" + confirm);
//         }
//
//         user.save();
//         console.log(user.newpass);
//         middleware.dmcRedirect(res,'/admin/knock');
//     });
// });


router.get("/puzzles", function(req, res){
    // Get all problems from DB
    Problem.find({}, function(err, allProblems) {
        if (err) {
            console.log(err);
        } else {
            res.render("problems/index", {problems: allProblems});
        }
    });
});

//NEW - show form to create new problem
router.get("/puzzles/new", function(req, res){
    res.render("problems/new");
});

// SHOW - shows more info about one problem
router.get("/puzzles/:id", function(req, res){
    //find the problem with provided ID
    Problem.findById(req.params.id).populate("comments").exec(function(err, foundProblem){
        if(err){
            console.log(err);
        } else {
            //render show template with that problem
            res.render("problems/show", {problem: foundProblem});
        }
    });
});

router.get("/puzzles/:id/edit", function(req, res){
    //find the problem with provided ID
    Problem.findById(req.params.id, function(err, foundProblem){
        if(err){
            console.log(err);
        } else {
            //render show template with that problem
            res.render("problems/edit", {problem: foundProblem});
        }
    });
});

router.put("/puzzles/:id", function(req, res){
    var newData = {name: req.body.name, answer: req.body.answer,
        description: req.body.description,score:req.body.score,type:req.body.type
    };
    Problem.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, problem){
        if(err){
            req.flash("error", err.message);
            middleware.dmcRedirect(res,"back");
        } else {
            req.flash("success","Successfully Updated!");
            middleware.dmcRedirect(res,"/admin/problems/"+problem._id);
        }
    });
});

router.delete("/puzzles/:problem_id",function(req, res,next){
    var problem_id = req.params.problem_id;
    Problem.findOne({'_id':req.params.problem_id}).exec(function(err,problem) {
        if(err) return next(err);
        problem.remove();
        req.flash("success"," Successfully deleted!");
        middleware.dmcRedirect(res,"/admin/problems");
    });
});

router.get("/setStartTime", function(req, res){
    var t = new Date(Date.now()),
        dur = 1;
    Rule.findOne({name:"DMC"}).exec(function (err,rule) {
        if(rule){
            t = rule.startDate;
            dur = rule.duration / (3600*1000);
        }
        var tstr = t.getFullYear() + "-" + ((t.getMonth()+1) < 10 ? "0" + (t.getMonth()+1) : (t.getMonth()+1)) + "-" + (t.getDate() < 10 ? "0" + t.getDate() : t.getDate()) + "T" + (t.getHours() < 10 ? "0" + t.getHours() : t.getHours()) + ":" + (t.getMinutes() < 10 ? "0" + t.getMinutes() : t.getMinutes());
        res.render("dev/setStartTime", {startTime: tstr, dur: dur});
    });
});
router.post("/setStartTime", function(req, res){
    var d = new Date(req.body.startTime + "+03:30"),
        dur = req.body.dur;
    Rule.findOne({name:"DMC"}).exec(function (err,rule) {
        // console.log(rule);
        if(rule)
            rule.remove();
        Rule.create({name:"DMC",startDate: d,duration:dur*3600*1000});
        console.log("Start Time set to " + d.toString() + " and Duration to " + dur + ".");
        //toLocaleDateString("fa-IR", {year: "2-digit", month: "long", day: "numeric", hour: "numeric", minute: "numeric"})
        req.flash("success", "Start Time set to " + d.toString() + " and Duration to " + dur + ".");
        middleware.dmcRedirect(res,"/admin/");
    });
});

router.get("/mailToAll", function(req, res){
    res.render("dev/mailToAll", {});
});

router.post("/mailToAll", function(req, res){
    mailer.sendTemplateToAll(mailTemplates + "custom", {address: host, title: req.body.title, text: req.body.text}
        ,function(err, info) {
        console.log("Mail to All\t" + err + info);
        req.flash("success", "Email has sent to all users.");
        middleware.dmcRedirect(res,'/admin/');
    });
});

module.exports = router;
