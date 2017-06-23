var express = require("express");
var mongoose = require("mongoose");
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
var upload = multer({
    dest: './Uploads/',
    onFileUploadComplete: function (file) {
        console.log(file.fieldname + ' uploaded to  ' + file.path)
    }
});
var sanitize = require('mongo-sanitize');
var path = require('path');
const clar = require("../models/clar");
const submissionWait = 20*1000;
// router.all("/*",middleware.isLoggedIn,middleware.havePermission);
//INDEX - show all problems
// router.all("/*",middleware.isLoggedIn);

// router.all("/*",function (req,res,next) {
//     Rule.findOne({name:"DMC"}).exec(function (err,rule) {
//         if(req.user.isAdmin || env == "dev")
//         {
//           req.remainingTime = Date.now() - rule.startDate;
//           return next();
//         }
//         else if(Date.now() < rule.startDate) {
//             req.flash("error", "مسابقه هنوز آغاز نشده است.");
//             middleware.dmcRedirect(res, "/");
//         }
//         else if(Date.now()-rule.startDate > rule.duration) {
//             req.flash("error", "مسابقه به پایان رسیده است.");
//             middleware.dmcRedirect(res, "/ranking/");
//         }else{
//             req.remainingTime = rule.startDate - Date.now() + rule.duration;
//             return next();
//         }
//     });
// });

router.get("/", function(req, res){
    User.findById(req.user._id).then(function (user) {
        var time;
        Rule.findOne({name:"DMC"}).exec(function (err,rule) {
            if(Date.now() < rule.startDate)
                time = rule.startDate - Date.now();
            else if(Date.now() - rule.startDate < rule.duration)
                time = rule.startDate - Date.now() + rule.duration;
            else
                time = 0;
        });
        if(!user.group) {
            res.render("dashboard/index", {user: user, puzzles: null, superTags: null,remainingTime:time, currentUser: req.user});
        } else {
            if(cookie.getCookie(req,"easterEgg")=="found")
                user.group.easterEgg = 1;
            Puzzle.find({_id: {$in: user.group.competition.puzzles}}).populate("problem").exec(function (err, puzzles) {
                Tag.find({}).exec(function (err, superTags) {
                    if (err)
                        console.log(err);
                    else {
                        res.render("dashboard/index", {user: user, puzzles: puzzles, superTags: superTags,remainingTime:time, currentUser: req.user});
                    }
                })
            });
        }
    });
});

router.get("/puzzles", function(req, res){
    User.findById(req.user.id).then(function (user) {
        if(!user.group) {
            return res.json({puzzles:[]});
        } else {
            if(cookie.getCookie(req,"easterEgg")=="found")
                user.group.easterEgg = 1;
            Puzzle.find({_id: {$in: user.group.competition.puzzles}}).populate("problem").exec(function (err, puzzles) {
                Tag.find({}).exec(function (err, superTags) {
                    if (err)
                        console.log(err);
                    else {
                        return res.json({puzzles:puzzles});
                    }
                })
            });
        }
    })
});

router.get("/ranking", function(req, res){
    Group.find({}).populate("competition").exec(function (err,groups) {
            groups.forEach(function (group) {
                console.log(group.score);
                // group.calculateScore().then(function (score) {
                //     group.score = score;
                // })
            });
        res.render("dashboard/ranking",{groups:groups});
    });
});

router.get("/puzzles/:puzzle_id", function(req, res){
    User.findById(req.user._id).then(function (user) {
        Puzzle.findById(req.params.puzzle_id).populate(["problem","group"]).exec( function (err, puzzle) {
            user.group.view(puzzle).then(function (bought) {
                if(bought) {
                    puzzle.cacheSources().then(function () {
                        res.render("dashboard/puzzle/show", {puzzle: puzzle, currentUser: req.user});
                    });
                } else {
                        req.flash("error", "شما اعتبار کافی ندارید. اعتبار مورد نیاز: " + puzzle.cost);
                        middleware.dmcRedirect(res, "/dashboard/");
                    }
            });
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
                middleware.dmcRedirect(res,"/dashboard/puzzles/"+puzzle._id);
            }
        });
    });
});

router.post("/puzzles/:puzzle_id/answer",upload.single("file"), function(req, res){
    var answer = sanitize(req.body.answer);
    // User.findById(req.user._id).populate("group").exec(function (err,user) {
        Puzzle.findById(req.params.puzzle_id).deepPopulate(["problem","group","group.competition"]).exec(function (err, puzzle) {
            if (err) {
                console.log(err);
            } else {
                // if(Date.now() - submissionWait > puzzle.lastSubmit ) {
                    if(req.file) {
                        puzzle.submitFile(req.file).then(function () {
                            req.flash("success", "جواب شما ثبت شد!");
                        });
                        // puzzle.submisson.file = user.group.name + path.extname(req.file.originalname);
                        // puzzle.lastSubmit = Date.now();
                        // var submission_dir = puzzle.problem.dir + "Submissions";
                        // var submission_name = puzzle.submisson.file;
                        // if (puzzle.submisson.file)
                        //     if (fs.existsSync(submission_dir + "/" + submission_name))fs.unlinkSync(submission_dir + "/" + submission_name);
                        // middleware.uploadToDir(req.file.path, submission_dir, submission_name);
                        // submission_name = user.group.name + path.extname(req.file.originalname);
                        // puzzle.status = "submitted";
                        // puzzle.save();
                        // req.flash("success", "جواب شما ثبت شد!");
                    }
                    else if(answer != "")
                    {
                        if (puzzle.submitAnswer(answer))
                            req.flash("success", "جواب شما درست بود:)");
                        else
                            req.flash("error", "جواب شما نادرست بود :(");
                    }
                // }else
                //     req.flash("error", "برای ثبت دوباره جواب باید منتظر بمانید");
                middleware.dmcRedirect(res, "/dashboard/");
            }
        });
    // });
});

module.exports = router;
