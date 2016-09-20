var express = require("express");
var router  = express.Router();
var Problem = require("../models/problem");
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
var fs = require("fs");
var sanitize = require('mongo-sanitize');
// router.all("/*",middleware.isLoggedIn,middleware.havePermission);
//INDEX - show all problems
router.all("/*",middleware.isLoggedIn);
router.get("/", function(req, res){
    User.findById(req.user._id).populate("group").exec(function (err,user) {
        Problem.find({$and:[{tags:user.group.competition.stage},{_id:{$in:user.group.competition.solvedProblems}}]},
            function(err, solvedProblems) {
                Problem.find({$and:[{tags:user.group.competition.stage},{_id:{$nin:user.group.competition.solvedProblems}}]},
                    function(err, unsolvedProblems) {
                        Problem.findOne({tags:"meta"+user.group.competition.stage},
                            function(err, metaPuzzle) {
                                var canGoToNextStage = user.group.solved(metaPuzzle._id);
                                console.log(user.group.competition.solvedProblems.indexOf(metaPuzzle._id));
                                if (err) {
                                    console.log(err);
                                } else {
                                    res.render("dashboard/index", {
                                        unsolvedProblems: unsolvedProblems,
                                        solvedProblems: solvedProblems,
                                        metaPuzzle:metaPuzzle,
                                        canGoToNextStage:canGoToNextStage
                                    });
                                }
                });
             });
        });
    });
});

router.get("/problems/:problem_id", function(req, res){
    User.findById(req.user._id).populate("group").exec(function (err,user) {
        Problem.findById(req.params.problem_id, function (err, problem) {
            if (err) {
                console.log(err);
            } else {
                var solved = (user.group.competition.solvedProblems.indexOf(problem._id) != -1);
                    res.render("problems/show_participant", {problem: problem, solved:solved});
            }
        });
    });
});

router.post("/problems/:problem_id/answer", function(req, res){
    var answer = sanitize(req.body.answer);
    console.log(answer);
    User.findById(req.user._id).populate("group").exec(function (err,user) {
        Problem.findById(req.params.problem_id, function (err, problem) {
            if (err) {
                console.log(err);
            } else {
                if(problem.submitAnswer(answer))
                {
                    user.group.competition.solvedProblems.push(problem);
                    user.group.competition.score +=  problem.score;
                    user.group.save();
                    req.flash("success", "Your answer was correct :)" );
                }
                else
                {
                    req.flash("success", "Your answer was not correct :(" );
                }
                res.redirect("/dashboard");
            }
        });
    });
});

router.get("/nextstage", function(req, res){
    User.findById(req.user._id).populate("group").exec(function (err,user) {
        Problem.findOne({tags:"meta"+user.group.competition.stage},
            function(err, metaPuzzle) {
                var canGoToNextStage = user.group.solved(metaPuzzle._id);
                if (err) {
                    console.log(err);
                } else {
                    if(!canGoToNextStage)
                    {
                    req.flash("success", "Your answer was correct :)" );
                        res.redirect("/dashboard");
                    }
                    else {
                        user.group.competition.stage += 1;
                        user.group.save();
                        res.redirect("/dashboard");
                    }
                }
            });
    });
});

module.exports = router;

