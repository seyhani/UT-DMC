let mongoose        = require("mongoose"),
    path            = require('path'),
    middleware      = require("../middleware/index"),
    token           = require("../middleware/token"),
    fileManager     = require("../middleware/fileManager"),
    deepPopulate    = require('mongoose-deep-populate')(mongoose);
//Puzzle status
//new -> sold -> submitted -> rejected
//                         -> accepted

const submissionWait = 20*1000,
      cacheRootDirectory = "./public/cache/problems" ;
var PuzzleSchema = new mongoose.Schema({
    problem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem"
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
    },
    tags:[String],
    lastSubmit:{type:Date,default:Date.now()-submissionWait},
    status: {type:String,default:"new"},
    submisson:{
        file:String,
        answer:String,
    },
    cacheHash:{type:String,default:null}
});


PuzzleSchema.methods.hasTag = function (tag) {
    return (this.tags.indexOf(tag) != -1);
};

PuzzleSchema.virtual('type').get(function (){
    return this.problem.type;
});

PuzzleSchema.methods.submitAnswer = function (answer) {
    this.lastSubmit = Date.now();
    this.status = "submitted";
    var answers = this.problem.answer.split(" ");
    var correctAnswer;
    if(answers.length > 1)
        correctAnswer = answers[this.group.index%answers.length];
    else
        correctAnswer = this.problem.answer;
    if(answer == correctAnswer) {
        this.status = 'accepted';
        this.problem.submits.correct++;
        this.group.competition.score += this.problem.score;
        this.group.competition.save();
        this.group.credit += this.payback;
        this.group.save();
    }else{
        this.status = "rejected";
        this.problem.submits.wrong++;
    }
    this.problem.save();
    this.save();

    return answer == correctAnswer;
};

PuzzleSchema.methods.submitFile = function (file) {
    var puzzle = this;
    return new Promise((resolve,reject) => {
        puzzle.submisson.file = puzzle.group.name + path.extname(file.originalname);
        puzzle.lastSubmit = Date.now();
        var submission_dir = problemFilesRootDirectory+ "/" + puzzle.problem._id+"/"+ "Submissions";
        var submission_name = puzzle.submisson.file;
        fileManager.removeFile(submission_dir + "/" + submission_name).then(function () {
            fileManager.moveFileToDir(file.path, submission_dir, submission_name).then(function () {
                puzzle.status = "submitted";
                puzzle.save(resolve);
            });
        });
    });
};

PuzzleSchema.methods.accept = function () {
    new Promise((resolve,reject) => {
        this.status = "accepted";
        this.problem.submits.correct++;
        this.problem.save();
        this.group.competition.save();
        this.group.save();
        this.save();
    });
};

PuzzleSchema.methods.reject= function () {
    new Promise((resolve,reject) => {
        this.status = "rejected";
        this.problem.submits.wrong++;
        this.problem.save();
        this.group.competition.save();
        this.group.save();
        this.save();
    });
};

PuzzleSchema.virtual('sourcesDir').get(function (){
    return cacheRootDirectory + "/" + this.cacheHash ;
});


PuzzleSchema.methods.cacheSources = function () {
    return this.problem.cacheSources();
};

PuzzleSchema.methods.cacheSubmission = function () {
    return new Promise((resolve,reject) => {
        var puzzle = this;
        var puzzleCacheDir = puzzleCacheRootDirectory + "/" + puzzle._id;
        fileManager.makeDirectory(puzzleCacheDir).then(function () {
            var puzzleSubmissionSource = puzzle.filePath;
                fileManager.copyFileToDir(puzzleSubmissionSource, puzzleCacheDir, puzzle.submisson.file)
                    .then(function () {
                        console.log(puzzleCacheDir);
                    resolve();
                });
        });
    });
};

PuzzleSchema.methods.calculateScore = function () {
}

PuzzleSchema.virtual('name').get(function () {
    return this.problem.name;
});

PuzzleSchema.virtual('new').get(function () {
    return this.status == "new";
});

PuzzleSchema.virtual('sold').get(function () {
    return this.status == "sold";
});

PuzzleSchema.virtual('submitted').get(function () {
    return this.status == "submitted";
});

PuzzleSchema.virtual('rejected').get(function () {
    return this.status == 'rejected';
});

PuzzleSchema.virtual('accepted').get(function () {
    return this.status == "accepted";
});

PuzzleSchema.virtual('score').get(function () {
    return this.problem.score;
});

PuzzleSchema.virtual('filePath').get(function () {
    return this.problem.dir + "/" + "Submissions" + "/" + this.submisson.file;
});

PuzzleSchema.virtual('submissionFile').get(function () {
    return "./cache/puzzles/"  + this._id + "/" + this.submisson.file;
});

PuzzleSchema.virtual('cost').get(function () {
    return this.problem.score/2 ;
});

PuzzleSchema.virtual('payback').get(function () {
    return (this.problem.score/2) ;
});

PuzzleSchema.virtual('sources').get(function () {
    return fileManager.readAllFilesFromDir(this.problem.cacheDir);
});

PuzzleSchema.virtual('requestedForHint').get(function () {
    return  this.status == "requestedForHint";
});

PuzzleSchema.plugin(deepPopulate);

module.exports = mongoose.model("Puzzle", PuzzleSchema);
