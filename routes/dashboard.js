var express = require("express");
var router  = express.Router();
var Rule = require("../models/rule");
var Tag = require("../models/tag");
var Group = require("../models/group");
var Puzzle = require("../models/puzzle");
var User = require("../models/user");
var middleware = require("../middleware/index");
var cookie = require("../middleware/cookie");
var request = require("request");
var multer = require('multer');
var rimraf = require('rimraf');
var fs = require("fs");
let _ = require('lodash');
var upload = multer({
    dest: './Uploads/',
    onFileUploadComplete: function (file) {
        console.log(file.fieldname + ' uploaded to  ' + file.path)
    }
});
var sanitize = require('mongo-sanitize');
var path = require('path');
const clar = require("../models/clar");
let async = require('async');
const submissionWait = 20*1000;
// router.all("/*",middleware.isLoggedIn,middleware.havePermission);
//INDEX - show all problems
router.all("/*",middleware.isLoggedIn);

router.all("/*",function (req,res,next) {
    Rule.findOne({name:"DMC"}).exec(function (err,rule) {
        if(req.user.isAdmin)
        {
          req.remainingTime = Date.now() - rule.startDate;
          return next();
        }
        else if(Date.now() < rule.startDate) {
            req.flash("error", "مسابقه هنوز آغاز نشده است.");
            middleware.dmcRedirect(res, "/");
        }
        else if(Date.now()-rule.startDate > rule.duration) {
            req.flash("error", "مسابقه به پایان رسیده است.");
            middleware.dmcRedirect(res, "/ranking/");
        }else{
            req.remainingTime = rule.startDate - Date.now() + rule.duration;
            return next();
        }
    });
});
router.get("/", function(req, res){
    //req.flash("success", "برای تأیید ایمیل، به ایمیل خود مراجعه کنید.");
    User.findById(req.user.id)
        .deepPopulate(["group","group.competition.puzzles","group.competition.rule",
            "group.competition.puzzles.problem","group.competition"])
        .exec(function (err,user) {
            if(!user.group) {
                res.render("dashboard/index", {user: user, puzzles: null, superTags: null,remainingTime:req.remainingTime, currentUser: req.user});
            } else {
                if(cookie.getCookie(req,"easterEgg")=="found")
                    user.group.easterEgg = 1;
                if (err)
                    console.log(err);
                else {
                    Puzzle.find({_id: {$in: user.group.competition.puzzles}}).deepPopulate(["problem","problem.prerequisites","judge"]).exec(function (err, puzzles) {
                        let problems = [];
                      async.each(puzzles, function(puzzle, callback) {
                          if(puzzle.problem === null)
                              return callback();
                          let prerequisitesMet = _.every(puzzle.problem.prerequisites,function(prerequisite) {
                            return user.group.solvedProblems.indexOf(prerequisite._id) !== -1;
                          });
                          //console.log(puzzle.problem.name,user.group.solvedProblems,puzzle.problem.prerequisites);
                          if(prerequisitesMet && puzzle.status === 'new'){
                              puzzle.status = 'sold';
                          }
                          puzzle.save(function() {
                              callback();
                          });
                      }, function(err) {
                          puzzles.forEach(function(p) {
                            //console.log(p.status);
                          });
                        Tag.find({}).exec(function (err, superTags) {
                          if (err)
                            console.log(err);
                          else {
                            res.render("dashboard/index", {user: user, puzzles: puzzles, superTags: superTags,remainingTime:req.remainingTime, currentUser: req.user});
                          }
                        })
                      });
                    });
                }
            }
    });
});

router.get("/ranking", function(req, res){
    Group.find({}).populate("competition").sort({"competition.stage": -1}).limit(20).exec(function (err,groups) {
        Puzzle.find().exec(function (err,puzzles) {
            groups.forEach(function (group) {
                group.competition.socre  = 0;
                puzzles.forEach(function (puzzle) {
                    if((group.competition.puzzles.indexOf(puzzle._id)!=-1)&&puzzle.accepted)
                        group.competition.socre += puzzle.score;
                });
            });
        });
        res.render("dashboard/ranking",{groups:groups});
    });
});

router.get("/tasks/:puzzle_id", function(req, res){
    User.findById(req.user._id).populate("group").exec(function (err,user) {
        Puzzle.findById(req.params.puzzle_id).populate(["judge","problem","group"]).exec( function (err, puzzle) {
            if (err) {
                console.log(err);
            } else {
                if(user.group.view(puzzle)) {
                    res.render("dashboard/puzzle/show", {puzzle: puzzle, currentUser: req.user});
                }
                else
                {
                    req.flash("error", "شما اعتبار کافی ندارید. اعتبار مورد نیاز: " + puzzle.cost);
                    middleware.dmcRedirect(res, "/dashboard/");
                }
            }
        });
    });
});

router.get("/tasks/:puzzle_id/hint", function(req, res){
    User.findById(req.user._id).populate("group").exec(function (err,user) {
        Puzzle.findById(req.params.puzzle_id).populate(["group","problem"]).exec(function (err, puzzle) {
            if (err) {
                console.log(err);
            } else {
                if(!puzzle.requsetForHint())
                    console.log("You do not have enough hints :(")
                middleware.dmcRedirect(res,"/dashboard/tasks/"+puzzle._id);
            }
        });
    });
});

router.post("/tasks/:puzzle_id/answer", function(req, res){
    //var answer = sanitize(req.body.answer);
    User.findById(req.user._id).populate("group").exec(function (err,user) {
        Puzzle.findById(req.params.puzzle_id).deepPopulate(["problem","group","group.competition"]).exec(function (err, puzzle) {
            if (err) {
                console.log(err);
            } else {
                if(Date.now() - submissionWait > puzzle.lastSubmit ) {
                    //if(req.file) {
                        //puzzle.submisson.file = user.group.name + path.extname(req.file.originalname);
                        //puzzle.lastSubmit = Date.now();
                        //var submission_dir = puzzle.problem.dir + "Submissions";
                        //var submission_name = puzzle.submisson.file;
                        //if (puzzle.submisson.file)
                        //    if (fs.existsSync(submission_dir + "/" + submission_name))fs.unlinkSync(submission_dir + "/" + submission_name);
                        //middleware.uploadToDir(req.file.path, submission_dir, submission_name);
                        //submission_name = user.group.name + path.extname(req.file.originalname);
                        puzzle.status = "submitted";
                        puzzle.save();
                        req.flash("success", "درخواست شما ثبت شد!");
                    //}
                    //else if(answer != "")
                    //{
                    //    if (puzzle.submitAnswer(answer))
                    //        req.flash("success", "جواب شما درست بود:)");
                    //    else
                    //        req.flash("error", "جواب شما نادرست بود :(");
                    //}
                }else
                    req.flash("error", "برای ثبت دوباره جواب باید منتظر بمانید");
                middleware.dmcRedirect(res, "/dashboard/");
            }
        });
    });
});

module.exports = router;
