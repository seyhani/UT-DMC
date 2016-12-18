var express = require("express");
var router  = express.Router();
var passport = require("passport");
var mongoose = require("mongoose");
var User = require("../models/user");
var Problem = require("../models/problem");
var Puzzle = require("../models/puzzle");
var Group = require("../models/group");

router.get("/", function(req, res){
    res.render('admin/index');
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

//CREATE - add new problem to DB
// router.post("/puzzles",upload.any() ,function(req, res){
//     // get data from form and add to problems array
//     var name = req.body.name;
//     var desc = req.body.description;
//     var answer = req.body.answer;
//     var score= req.body.score;
//     var feedback= req.body.feedback;
//     var newProblem = {name: name, description: desc,answer:answer,feedback:feedback,score:score ,submits:{correct:0,wrong:0}};
//     // Create a new problem and save to DB
//     Problem.create(newProblem, function(err, problem){
//         if(!fs.existsSync("./public/Uploads/Files/"+problem.id))
//             fs.mkdirSync("./public/Uploads/Files/"+problem.id);
//         if(req.files)
//         {
//             req.files.forEach(function (file) {
//                 problem.files.push(file.originalname);
//                 middleware.uploadToDir(file.path,problem.id,file.originalname);
//             });
//             problem.save();
//         }
//         if(err){
//             console.log(err);
//         } else {
//             //redirect back to problems page
//             // console.log(newlyCreated);
//             res.redirect("/admin/problems");
//         }
//     });
// });

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