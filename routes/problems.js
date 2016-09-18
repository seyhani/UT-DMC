var express = require("express");
var router  = express.Router();
var Problem = require("../models/problem");
var middleware = require("../middleware");
var request = require("request");
var multer = require('multer');
var rimraf = require('rimraf');
var upload = multer({
    dest: './UploadsTemp/',
    onFileUploadComplete: function (file) {
        console.log(file.fieldname + ' uploaded to  ' + file.path)
    }
});
var fs = require("fs");

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
    var newProblem = {name: name, description: desc, author:author}
    // Create a new problem and save to DB
    Problem.create(newProblem, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to problems page
            console.log(newlyCreated);
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
    console.log("IN EDIT!");
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
    var newData = {name: req.body.name, image: req.body.image, description: req.body.desc};
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


//middleware
// function isLoggedIn(req, res, next){
//     if(req.isAuthenticated()){
//         return next();
//     }
//     req.flash("error", "You must be signed in to do that!");
//     res.redirect("/login");
// }

module.exports = router;

