var express = require("express");
var router  = express.Router();
var passport = require("passport");
var mongoose = require("mongoose");
var User = require("../models/user");
var Problem = require("../models/problem");
var Puzzle = require("../models/puzzle");
var Group = require("../models/group");
var _ = require("lodash");

router.get("/", function(req, res){
    res.render('admin/index');
});

router.get("/newpass", function(req, res){
    res.render('dev/newpass');
});
router.get("/rycode", function(req, res){
    res.render('dev/rycode');
});
router.post("/newpass", function(req, res){
    var newpass = [];
    for(var key in req.body) {
        newpass.push(req.body[key]);
    }
    var uniq = _.uniq(newpass, function(x){
        return x;
    });
    newpass  = newpass.map(function (item ,index) {
        return uniq.indexOf(item);
    });
    User.findOne({username:"a"}).exec(function (err,user) {
        if(!user.rycode != []) {
            if (user.rycode != newpass) {
                req.flash("error", "Your rycodes do not match!");
                user.rycode = [];
                user.save();
            }
            else
                req.flash("success", "Your rycode has been set!");
        }
        else {
            user.rycode = newpass;
            user.save();
            req.flash("success", "Confirm your rycode again!");
        }
        res.redirect('/admin/newpass');
    });
});


router.post("/rycode", function(req, res){
    var newpass = [];
    for(var key in req.body) {
        newpass.push(req.body[key]);
    }
    var uniq = _.uniq(newpass, function(x){
        return x;
    });
    newpass  = newpass.map(function (item ,index) {
        return uniq.indexOf(item);
    });
    newpass =[];
    for(var i in newpass)
        newpass.push(newpass[i]);
    User.findOne({username:"a"}).exec(function (err,user) {
        console.log(user.rycode);
        console.log(newpass);
        console.log(user.rycode[0]==newpass)
        var is_same = (user.rycode.length == newpass) && newpass(function(element, index) {
                return element == user.rycode[index];
            });
        if (is_same)
            req.flash("success", "Your rycode was true!");
        else
            req.flash("error", "Your rycode was wrong!");

        res.redirect('/admin/rycode');
    });
});

router.get("/console", function(req, res){
    res.render('console');
});

router.post("/console", function(req, res){
    var command = req.body.input.split(" ");
    var model = command[1];
    command = command[0];
    if(command == "clean")
        mongoose.model(model).remove({},function (err) {});
    res.redirect('/admin/console');
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
//         res.redirect('/admin/knock');
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
        description: req.body.description,score:req.body.score,feedback:req.body.feedback
    };
    Problem.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, problem){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/admin/problems/"+problem._id);
        }
    });
});

router.delete("/puzzles/:problem_id",function(req, res,next){
    var problem_id = req.params.problem_id;
    Problem.findOne({'_id':req.params.problem_id}).exec(function(err,problem) {
        if(err) return next(err);
        problem.remove();
        req.flash("success"," Successfully deleted!");
        res.redirect("/admin/problems");
    });
});


module.exports = router;