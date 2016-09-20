var express = require("express");
var router  = express.Router();
var Problem = require("../models/problem");
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
router.get("/", function(req, res){
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
router.post("/",upload.any() ,function(req, res){
    // get data from form and add to problems array
    console.log(req.files);
    var name = req.body.name;
    var desc = req.body.description;
    var answer = req.body.answer;
    var score= req.body.score;
    var newProblem = {name: name, description: desc,answer:answer,score:score};
    // Create a new problem and save to DB
    Problem.create(newProblem, function(err, problem){
        if(!fs.existsSync("./public/Uploads/Files/"+problem.id))
            fs.mkdirSync("./public/Uploads/Files/"+problem.id);
        if(req.files)
        {
            req.files.forEach(function (file) {
                problem.files.push(file.originalname);
                middleware.uploadToDir(file.path,problem.id,file.originalname);
            });
            problem.save();
        }
        if(err){
            console.log(err);
        } else {
            //redirect back to problems page
            // console.log(newlyCreated);
            res.redirect("/problems");
        }
    });
});

//NEW - show form to create new problem
router.get("/new", function(req, res){
   res.render("problems/new"); 
});

// SHOW - shows more info about one problem
router.get("/:id", function(req, res){
    //find the problem with provided ID
    Problem.findById(req.params.id).populate("comments").exec(function(err, foundProblem){
        if(err){
            console.log(err);
        } else {
            console.log(foundProblem)
            //render show template with that problem
            res.render("problems/show", {problem: foundProblem});
        }
    });
});

router.get("/:id/edit", function(req, res){
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

router.put("/:id", function(req, res){
    var newData = {name: req.body.name, answer: req.body.answer, description: req.body.description,score:req.body.score};
    Problem.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, problem){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/problems/" + problem._id);
        }
    });
});

router.post('/:problem_id/tag', function(req, res,next) {
    Problem.findById(req.params.problem_id,function (err,problem) {
        if(err) return next(err);
        problem.tag = req.body.tag;
        res.redirect("/problems/"+req.params.problem_id);
    });
});

router.delete("/:problem_id",function(req, res,next){
    var problem_id = req.params.problem_id;
    Problem.findOne({'_id':req.params.problem_id}).exec(function(err,problem) {
        if(err) return next(err);
        problem.remove();
        req.flash("success"," Successfully deleted!");
        res.redirect("/problems" );
    });
});

module.exports = router;

