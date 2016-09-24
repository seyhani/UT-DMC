var express = require("express");
var router  = express.Router();
var Problem = require("../models/problem");
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
var fs = require("fs");
var sanitize = require('mongo-sanitize');
// router.all("/*",middleware.isLoggedIn,middleware.havePermission);
//INDEX - show all problems
router.all("/*",middleware.isLoggedIn);

router.get("/", function(req, res){
    User.findById(req.user._id).populate("group").exec(function (err,user) {
        if(!user.group) {
            res.render("dashboard/index", {puzzles: null, metaPuzzle: null, canGoToNextStage: null});
        }else {
            user.group.findCurrentStagePuzzles(function (err, puzzles) {
                user.group.findCurrentStageMetaPuzzle(function (err, metaPuzzle) {
                    var canGoToNextStage = false;
                    if (metaPuzzle)
                        canGoToNextStage = metaPuzzle.solved;
                    if (err) {
                        console.log(err);
                    } else {
                        res.render("dashboard/index",
                            {
                                puzzles: puzzles,
                                metaPuzzle: metaPuzzle,
                                canGoToNextStage: canGoToNextStage
                            }
                        );
                    }
                });
            });
        }
    });
});

router.get("/ranking", function(req, res){
    Group.find({}).sort({"competition.stage": -1}).limit(20).exec(function (err,groups) {
       res.render("dashboard/ranking",{groups:groups});
    });
});

router.get("/puzzles/:puzzle_id", function(req, res){
    User.findById(req.user._id).populate("group").exec(function (err,user) {
        Puzzle.findById(req.params.puzzle_id).populate(["problem","group"]).exec( function (err, puzzle) {
            if (err) {
                console.log(err);
            } else {
                res.render("problems/show_participant",{puzzle: puzzle});
            }
        });
    });
});

router.get("/puzzles/:puzzle_id/hint", function(req, res){
    User.findById(req.user._id).populate("group").exec(function (err,user) {
        Puzzle.findById(req.params.puzzle_id).populate(["group","problem"]).exec(function (err, puzzle) {
            if (err) {
                console.log(err);
            } else {
                if(!puzzle.requsetForHint())
                    console.log("You do not have enough hints :(")
                res.redirect("/dashboard/puzzles/"+puzzle._id);
            }
        });
    });
});

router.post("/puzzles/:puzzle_id/answer", function(req, res){
    var answer = sanitize(req.body.answer);
    User.findById(req.user._id).populate("group").exec(function (err,user) {
        Puzzle.findById(req.params.puzzle_id).populate(["problem","group"]).exec(function (err, puzzle) {
            if (err) {
                console.log(err);
            } else {
                if(Date.now() - 1*1000 > puzzle.lastSubmit ) {
                    if (puzzle.submitAnswer(answer)) {
                        console.log("Your answer was correct :)");
                        req.flash("success", "Your answer was correct :)");
                    }
                    else {
                        console.log("Your answer was not correct :(");
                        req.flash("error", "Your answer was not correct :(");
                    }
                }else{
                    console.log( "Wait a little before next submit!");
                    req.flash("error", "Wait a little before next submit!");
                }
                res.redirect("/dashboard");
            }
        });
    });
});

router.get("/nextstage", function(req, res){
    User.findById(req.user._id).populate("group").exec(function (err,user) {
        user.group.findCurrentStageMetaPuzzle(function (err,metaPuzzle){
                if (err) {
                    console.log(err);
                } else {
                    if(!metaPuzzle.solved)
                    {
                        req.flash("success", "Your have not solved the meta puzzle yet :(" );
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

