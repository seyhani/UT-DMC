var express = require("express");
var router  = express.Router();
var Problem = require("../models/problem");
var Puzzle = require("../models/puzzle");
var Tag = require("../models/tag");
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

router.all("/*",middleware.isAdminLoggedIn,middleware.havePermission);

router.get("/", function(req, res){
    Problem.find({}, function(err, allProblems) {
        if (err) {
            console.log(err);
        } else {
            Tag.find({}).exec(function (err,superTags) {
                app.locals.currentUser = req.user;
                res.render("admin/problems/index", {problems: allProblems,superTags:superTags});
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
    var type= req.body.type;
    var problem =new Problem( {name: name, description: desc,answer:answer,type:type,score:score ,submits:{correct:0,wrong:0}});
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
                middleware.dmcRedirect(res,"back");
            } else {
                req.flash("success", "Successfully Added!");
                middleware.dmcRedirect(res,"/admin/problems/"+problem._id);
            }
        }else{
            req.flash("error", "Problem already exist!");
            middleware.dmcRedirect(res,"/admin/problems/");
        }
    });
});

//NEW - show form to create new problem
router.get("/new", function(req, res){
    app.locals.currentUser = req.user;
    res.render("admin/problems/new");
});

// SHOW - shows more info about one problem
router.get("/:id", function(req, res){
    //find the problem with provided ID
    Problem.findById(req.params.id).exec(function(err, foundProblem){
        Puzzle.find({problem:foundProblem,status:"submitted"}).exec(function (err,submissons) {
            Tag.find({}).exec(function (err,superTags) {
                if(err)
                    console.log(err);
                else {
                    app.locals.currentUser = req.user;
                    res.render("admin/problems/show", {problem: foundProblem,submissions:submissons,superTags:superTags});
                }
            });
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
            app.locals.currentUser = req.user;
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
            middleware.dmcRedirect(res,"/admin/problems/"+foundProblem._id);
        }
    });
});

router.put("/:id/edit",upload.any() , function(req, res){
    var newData = {name: req.body.name, answer: req.body.answer,
        description: req.body.description,score:req.body.score,type:req.body.type
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
            middleware.dmcRedirect(res,"back");
        } else {
            req.flash("success","Successfully Updated!");
            middleware.dmcRedirect(res,"/admin/problems/"+problem._id);
        }
    });
});

router.post('/:problem_id/tag', function(req, res,next) {
    Problem.findById(req.params.problem_id,function (err,problem) {
        if(err) return next(err);
        problem.tag = req.body.tag;
        middleware.dmcRedirect(res,"/admin/problems/"+problem._id);
    });
});

router.delete("/:problem_id",function(req, res,next){
    var problem_id = req.params.problem_id;
    Problem.findOne({'_id':req.params.problem_id}).exec(function(err,problem) {
        if(err) return next(err);
        problem.remove();
        req.flash("success"," Successfully deleted!");
        middleware.dmcRedirect(res,"/admin/problems");
    });
});

module.exports = router;
