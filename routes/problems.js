const express = require("express");
var router = express.Router();
const Problem = require("../models/problem");
const Puzzle = require("../models/puzzle");
const Group = require("../models/group");
const Tag = require("../models/tag");
const middleware = require("../middleware");
const request = require("request");
const multer = require('multer');
const rimraf = require('rimraf');
const fs = require("fs");
const upload = multer({
  dest: './Uploads/',
  onFileUploadComplete: function(file) {
    console.log(file.fieldname + ' uploaded to  ' + file.path);
  }
});
const _ = require('lodash');

router.all("/*", middleware.isAdminLoggedIn, middleware.havePermission);

router.get("/", function(req, res) {
  Problem.find({}, function(err, allProblems) {
    if(err) {
      console.log(err);
    } else {
      Tag.find({}).exec(function(err, superTags) {
        res.render("admin/problems/index", {problems: allProblems, superTags: superTags, currentUser: req.user});
      });
    }
  });
});

//CREATE - add new problem to DB
router.post("/", upload.any(), function(req, res) {
  // get data from form and add to problems array
  var name = req.body.name;
  var desc = req.body.description;
  var answer = req.body.answer;
  var score = req.body.score;
  var type = req.body.type;
  var problem = new Problem({
    name: name,
    description: desc,
    answer: answer,
    type: type,
    score: score,
    submits: {correct: 0, wrong: 0}
  });
  // Create a new problem and save to DB
  Problem.findOne({name: problem.name}).exec(function(err, foundProblem) {
    if(!foundProblem) {
      middleware.initialProblemDirectories(problem.name);
      if(req.files) {
        req.files.forEach(function(file) {
          problem.files.push(file.originalname);
          middleware.uploadToDir(file.path, problem.dir + "Sources", file.originalname);
        });
        problem.save();
      }
      if(err) {
        req.flash("error", err.message);
        middleware.dmcRedirect(res, "back");
      } else {
        req.flash("success", "Successfully Added!");
        middleware.dmcRedirect(res, "/admin/problems/" + problem._id);
      }
    } else {
      req.flash("error", "Problem already exist!");
      middleware.dmcRedirect(res, "/admin/problems/");
    }
  });
});

//NEW - show form to create new problem
router.get("/new", function(req, res) {
  res.render("admin/problems/new", {currentUser: req.user});
});

// SHOW - shows more info about one problem
router.get("/:id", function(req, res) {
  //find the problem with provided ID
  //Group.find().exec(function (err,groups) {
  Problem.findById(req.params.id).populate('prerequisites').exec(function(err, foundProblem) {
    Problem.find({_id:{$nin:foundProblem.prerequisites}}).exec(function(err, allProblems) {
      Puzzle.find({problem: foundProblem, status: "submitted"}).exec(function(err, submissons) {
        Group.getByProblemId(foundProblem._id).then(function(groups) {
          Tag.find({}).exec(function(err, superTags) {
            if(err)
              console.log(err);
            else
              res.render("admin/problems/show", {
                groups: groups,
                problem: foundProblem,
                submissions: submissons,
                problems: allProblems,
                superTags: superTags,
                currentUser: req.user
              });
          }).catch(function(err) {
            console.log(err);
          });
        });
      });
    });
  });
  //});
});

router.get("/:id/edit", function(req, res) {
  //find the problem with provided ID
  Problem.findById(req.params.id, function(err, foundProblem) {
    if(err) {
      console.log(err);
    } else {
      //render show template with that problem
      res.render("admin/problems/edit", {problem: foundProblem, currentUser: req.user});
    }
  });
});

router.get("/:id/reset", function(req, res) {
  //find the problem with provided ID
  Problem.findById(req.params.id, function(err, foundProblem) {
    if(err) {
      console.log(err);
    } else {
      foundProblem.reset();
      middleware.dmcRedirect(res, "/admin/problems/" + foundProblem._id);
    }
  });
});

router.put("/:id/edit", upload.any(), function(req, res) {
  var newData = {
    name: req.body.name, answer: req.body.answer,
    description: req.body.description, score: req.body.score, type: req.body.type
  };
  Problem.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, problem) {
    let fileNames = [];
    if(req.files) {
      middleware.removeProblemDirectories(problem.name);
      middleware.initialProblemDirectories(problem.name);
      req.files.forEach(function(file) {
        fileNames.push(file.originalname);
        middleware.uploadToDir(file.path, problem.dir + "Sources", file.originalname);
      });
      problem.files = fileNames;
      problem.save();
    }
    if(err) {
      req.flash("error", err.message + req.body.score);
      middleware.dmcRedirect(res, "back");
    } else {
      req.flash("success", "Successfully Updated!");
      middleware.dmcRedirect(res, "/admin/problems/" + problem._id);
    }
  });
});

router.post('/:problem_id/tag', function(req, res, next) {
  Problem.findById(req.params.problem_id, function(err, problem) {
    if(err) return next(err);
    problem.tag = req.body.tag;
    middleware.dmcRedirect(res, "/admin/problems/" + problem._id);
  });
});

router.post('/:problem_id/add', function(req, res, next) {
  Problem.findById(req.params.problem_id, function(err, problem) {
    Group.findById(req.body.group).populate("competition").exec(function(err, group) {
      Puzzle.create({problem: problem, group: group, tags: problem.tags},
        function(err, newPuzzle) {
          group.competition.puzzles.push(newPuzzle);
          group.competition.save();
          group.save(function(err) {
            middleware.dmcRedirect(res, "/admin/problems/" + problem._id);
          });

        });
    });
  });
});

router.post('/:problem_id/prerequisites', function(req, res, next) {
  Problem.findById(req.params.problem_id, function(err, problem) {
    Problem.findOne({_id:req.body.problem}).exec(function(err, prerequisiteProblem) {
      problem.prerequisites.addToSet(prerequisiteProblem);
      problem.save(function(err, savedProblem) {
        middleware.dmcRedirect(res, "/admin/problems/" + problem._id);
      });
    });
  });
});

router.get('/:problem_id/prerequisites/:pre_id', function(req, res, next) {
  Problem.findById(req.params.problem_id, function(err, problem) {
    Problem.findOne({_id:_.union(req.body.problem,problem._id)}).exec(function(err, prerequisiteProblem) {
      problem.prerequisites.remove(req.params.pre_id);
      problem.save(function(err, savedProblem) {
        middleware.dmcRedirect(res, "/admin/problems/" + problem._id);
      });
    });
  });
});

router.delete("/:problem_id", function(req, res, next) {
  var problem_id = req.params.problem_id;
  Problem.findOne({'_id': req.params.problem_id}).exec(function(err, problem) {
    if(err) return next(err);
    problem.remove();
    req.flash("success", " Successfully deleted!");
    middleware.dmcRedirect(res, "/admin/problems");
  });
});

module.exports = router;
