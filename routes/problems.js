var express = require("express");
var router  = express.Router();
var Problem = require("../models/problem");
var Puzzle = require("../models/puzzle");
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
// router.all("/*",middleware.isLoggedIn,middleware.havePermission);
//INDEX - show all problems

// router.all("/*",middleware.isAdminLoggedIn,middleware.havePermission);

router.get("/", function(req, res){
    Problem.find({}, function(err, allProblems) {
        if (err) {
            console.log(err);
        } else {
            Problem.getAllTags(function (tags) {
                res.render("admin/problems/index", {problems: allProblems,tags:tags});
            });
        }
    });
});

//CREATE - add new problem to DB
router.post("/",upload.any() ,function(req, res){
    // get data from form and add to problems array
    var name = req.body.name;
    var desc = req.body.description;
    var answer = req.body.answer;
    var score= req.body.score;
    var feedback= req.body.feedback;
    var problem =new Problem( {name: name, description: desc,answer:answer,feedback:feedback,score:score ,submits:{correct:0,wrong:0}});
    // Create a new problem and save to DB
    Problem.findOne({name:problem.name}).exec(function (err,foundProblem) {
        if(!foundProblem) {
            middleware.initialProblemDirectories(problem.name);
            if (req.files) {
                req.files.forEach(function (file) {
                    problem.files.push(file.originalname);
                    middleware.uploadToDir(file.path, problem.dir + "Sources", file.originalname);
                });
                problem.save();
            }
            if (err) {
                req.flash("error", err.message);
                res.redirect("back");
            } else {
                req.flash("success", "Successfully Added!");
                res.redirect("/admin/problems");
            }
        }else{
            req.flash("error", "Problem already exist!");
            res.redirect("/admin/problems");
        }
    });
});

//NEW - show form to create new problem
router.get("/new", function(req, res){
   res.render("admin/problems/new");
});

// SHOW - shows more info about one problem
router.get("/:id", function(req, res){
    //find the problem with provided ID
    Problem.findById(req.params.id).populate("comments").exec(function(err, foundProblem){
        Puzzle.find({problem:foundProblem,status:"submitted"}).exec(function (err,submissons) {
            console.log(submissons);
            if(err)
                console.log(err);
            else
                res.render("admin/problems/show", {problem: foundProblem,submissions:submissons});
        });
    });
});

router.get("/:id/edit", function(req, res){
    //find the problem with provided ID
    Problem.findById(req.params.id, function(err, foundProblem){
        if(err){
            console.log(err);
        } else {
            //render show template with that problem
            res.render("admin/problems/edit", {problem: foundProblem});
        }
    });
});

router.get("/:id/reset", function(req, res){
    //find the problem with provided ID
    Problem.findById(req.params.id, function(err, foundProblem){
        if(err){
            console.log(err);
        } else {
            foundProblem.reset();
            res.redirect("/admin/problems/"+foundProblem._id);
        }
    });
});

router.put("/:id/edit",upload.any() , function(req, res){
    var newData = {name: req.body.name, answer: req.body.answer,
        description: req.body.description,score:req.body.score,feedback:req.body.feedback
    };
    Problem.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, problem){
        middleware.initialProblemDirectories(problem.name);
        if(req.files)
        {
            req.files.forEach(function (file) {
                problem.files.push(file.originalname);
                middleware.uploadToDir(file.path,problem.dir+"Sources",file.originalname);
            });
            problem.save();
        }
        if(err){
            req.flash("error", err.message + req.body.score);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/admin/problems/"+problem._id);
        }
    });
});

router.post('/:problem_id/tag', function(req, res,next) {
    Problem.findById(req.params.problem_id,function (err,problem) {
        if(err) return next(err);
        problem.tag = req.body.tag;
        res.redirect("/admin/problems/"+problem._id);
    });
});

router.delete("/:problem_id",function(req, res,next){
    var problem_id = req.params.problem_id;
    Problem.findOne({'_id':req.params.problem_id}).exec(function(err,problem) {
        if(err) return next(err);
        problem.remove();
        req.flash("success"," Successfully deleted!");
        res.redirect("/admin/problems");
    });
});

module.exports = router;
