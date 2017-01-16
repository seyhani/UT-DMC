var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var middleware = require("../middleware/index");
var Problem = require("../models/problem");
var Puzzle = require("../models/puzzle");
var Group = require("../models/group");
var Competition = require("../models/competition");
var middleware = require("../middleware/index");
var async = require('async');


router.all("/*",middleware.isAdminLoggedIn,middleware.havePermission);

router.get("/groups", function(req, res){
    Group.find({}).deepPopulate(['members','competition.puzzles','competition.puzzles.problem']).exec(function (err,groups) {
        res.render("admin/groups/index",{groups:groups});
    });
});

router.get("/groups/new", function(req, res){
    res.render("admin/groups/new");
});


router.post("/groups", function(req, res){
    Problem.find({}).exec(function (err,problems) {
        var newComp = {
            name:req.body.competitionName,stage: 0, puzzles: []
        };
        Competition.create(newComp, function (err, competition) {
            var group = new Group({name: req.body.groupName, competition:competition});
            group.index = Math.floor(Math.random() * 1000);
            Group.findOne({name:group.name}).exec(function (err,foundGroup) {
                if(!foundGroup)
                {
                    var puzzles = [];
                    problems.forEach(function (problem) {
                        puzzles.push({problem: problem, group: group, tags: problem.tags});
                    });
                    Puzzle.create(puzzles,
                        function (err, newPuzzles) {
                            group.competition.puzzles = newPuzzles;
                            group.competition.save();
                            group.save(function (err) {
                                middleware.dmcRedirect(res,'/admin/groups/' + group._id);
                            });
                        });

                } else {
                    req.flash("error","Group already exist!");
                    middleware.dmcRedirect(res,'/admin/groups/');
                }
            });
        });
    });
});

router.get("/groups/:groupId", function(req, res){
    Group.findById(req.params.groupId).deepPopulate(['members','competition.puzzles','competition.puzzles.problem'])
        .exec(function (err,group) {
            Puzzle.find({_id:{$in:group.competition.puzzles},status:"submitted"}).exec(function (err,puzzles) {
                User.find({_id:{$nin:group.members}}).exec(function (err,users) {
                    console.log(puzzles);
                    res.render("admin/groups/show",{group:group,users:users,submissions:puzzles});
                });
            });
        });
});

router.get("/groups/:groupId/edit", function(req, res){
    Group.findById(req.params.groupId).deepPopulate(['members','competition.puzzles','competition.puzzles.problem'])
        .exec(function (err,group) {
            User.find({_id:{$nin:group.members}}).exec(function (err,users) {
                res.render("admin/groups/edit",{group:group});
            });
        });
});

router.put("/groups/:groupId", function(req, res){
    var newData = {name: req.body.groupName, index: req.body.index,
        credit: req.body.credit
    };
    Group.findByIdAndUpdate(req.params.groupId, {$set: newData}, function(err, group){
        if(err){
            req.flash("error", err.message);
            middleware.dmcRedirect(res,"/admin/groups/");
        } else {
            req.flash("success","Successfully Updated!");
            middleware.dmcRedirect(res,"/admin/groups/"+group._id);
        }
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
        middleware.dmcRedirect(res,'/admin/groups/'+group._id);
    });
});

router.get("/groups/:groupId/puzzles/:puzzle_id", function(req, res){
    Puzzle.findById(req.params.puzzle_id).exec(function (err,puzzle) {
        res.render("admin/puzzle/show",{puzzle:puzzle});
    });
});

router.get("/groups/:groupId/hint/:problem_id", function(req, res){
    Group.findById(req.params.groupId).populate(['members','competition.puzzles']).exec(function (err,group) {
        Puzzle.findById(req.params.problem_id).populate("problem").exec(function (err,puzzle) {
            puzzle.status = "reviewd";
            puzzle.save();
            middleware.dmcRedirect(res,"/admin/groups/");
        });
    });
});

router.delete("/groups/:groupId", function(req, res){
    Group.findById(req.params.groupId).exec(function (err,group) {
        group.remove();
        middleware.dmcRedirect(res,'/admin/groups');
    });
});

module.exports = router;