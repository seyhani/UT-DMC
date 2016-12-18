var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var middleware = require("../middleware/index");
var Problem = require("../models/problem");
var Puzzle = require("../models/puzzle");
var Competition = require("../models/competition");




router.get("/competitions", function(req, res){
    Problem.find({}).exec(function (err,problems) {
        res.render("admin/competitions/index",{problems:problems});
    });
});

router.get("/competitions/new", function(req, res){
    res.render("admin/competitions/new");
});

router.post("/competitions", function(req, res){
    Problem.find({}).exec(function (err,problems) {
        var newComp = {
            stage: 0, puzzles: []
        };
        Competition.create(newComp, function (err, competition) {
            var newcompetition = new competition({name: req.body.competitionName, competition:competition});
            newcompetition.index = Math.floor(Math.random() * 1000);
            competition.create(newcompetition, function (err, competition) {
                if (err)
                    console.log(err);
                problems.forEach(function (problem) {
                    Puzzle.create({problem: problem, competition: competition, status: "unsolved", tags: problem.tags},
                        function (err, puzzle) {
                            competition.competition.puzzles.push(puzzle);
                            competition.competition.save();
                            competition.save();
                        });
                });
                res.redirect('competitions/' + competition._id);
            });
        });
    });
});

router.get("/competition/problems/:problem_id", function(req, res){
    Problem.findById(req.params.competitionId).exec(function (err,problem) {
        Puzzle.find({}).populate("group").exec(function (err,puzzles) {
            console.log(puzzles);
                res.render("admin/competitions/problem",{puzzles:puzzles});
            });
        });
});

router.post("/competitions/:competitionId/addUser", function(req, res){
    competition.findById(req.params.competitionId,function (err,competition) {
        User.findOne({username:req.body.username}).exec(function (err,user) {
            if(user) {
                competition.addMember(user);
            } else {
                req.flash('error','User Not Found');
            }
        });
        res.redirect('/admin/competitions/'+competition._id);
    });
});

router.get("/competitions/:competitionId/puzzles/:puzzle_id", function(req, res){
    Puzzle.findById(req.params.puzzle_id).exec(function (err,puzzle) {
        res.render("admin/puzzle/show",{puzzle:puzzle});
    });
});

router.get("/competitions/:competitionId/hint/:problem_id", function(req, res){
    competition.findById(req.params.competitionId).populate(['members','competition.puzzles']).exec(function (err,competition) {
        Puzzle.findById(req.params.problem_id).populate("problem").exec(function (err,puzzle) {
            puzzle.status = "reviewd";
            puzzle.save();
            res.redirect("/admin/competitions/");
        });
    });
});

router.delete("/competitions/:competitionId", function(req, res){
    Competition.findById(req.params.competitionId).exec(function (err,competition) {
        competition.remove();
        res.redirect('/admin/competitions');
    });
});

module.exports = router;