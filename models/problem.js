var mongoose    = require("mongoose");
let middleware  = require("../middleware/index"),
    fileManager = require("../middleware/fileManager"),
    async       = require("async");

var ProblemSchema = new mongoose.Schema({
    name: String,
    description:String,
    files:[String],
    answer:String,
    tags:[String],
    score:Number,
    type:String,
    submits:{
        wrong:{type:Number,default:0},
        correct:{type:Number,default:0}
    },
});

ProblemSchema.methods.hasTag = function (tag) {
    return (this.tags.indexOf(tag) != -1);
};

ProblemSchema.methods.reset = function () {
    this.submits.correct = 0;
    this.submits.wrong = 0;
    this.save();
};

ProblemSchema.methods.submitAnswer = function (answer) {
    var answers = this.answer.split(" ");
    if(answers.length==1)
        return (answer == this.answer);
    else {

    }
};

ProblemSchema.methods.cacheSources = function () {
    return new Promise((resolve,reject) => {
        var problem = this;
        var problemCacheDir = problemCacheRootDirectory + "/" + problem._id;
        fileManager.makeDirectory(problemCacheDir).then(function () {
            var problemSourcesDirectory = problem.sourceDir;
            async.each(problem.files, function (sourceFile) {
                fileManager.copyFileToDir(problemSourcesDirectory + "/" + sourceFile, problemCacheDir, sourceFile).then(function () {
                });
            });
            problem.cached = true;
            problem.save;
            resolve();
        });
    });
};

ProblemSchema.methods.initialDirectories = function () {
    return new Promise((resolve,reject) => {
        var problem = this;
        fileManager.makeDirectory("./Files/Problems/"+problem._id).then(function () {
            fileManager.makeDirectory("./Files/Problems/"+problem._id+"/Sources").then(function () {
                fileManager.makeDirectory("./Files/Problems/"+problem._id+"/Submissions").then(function () {
                    resolve();
                });
            });
        });
    });
};


ProblemSchema.virtual('tag').set(function (tag) {
    var problem = this;
    var foundtag = problem.tags.find(function (t) {
        return t == tag;
    });
    if(foundtag) {
        problem.tags.splice(problem.tags.indexOf(foundtag),1);
        problem.save();
    }else{
        problem.tags.push(tag);
        problem.save();
    }
});

ProblemSchema.virtual('dir').get(function () {
    return problemFilesRootDirectory + "/"+this._id;
});

ProblemSchema.virtual('sourceDir').get(function () {
    return this.dir+"/" + "Sources";
});

ProblemSchema.virtual('cacheDir').get(function () {
    return problemCacheRootDirectory+"/"+this._id;
});

ProblemSchema.virtual('sources').get(function () {
    return fileManager.readAllFilesFromDir(this.cacheDir) ;
});

ProblemSchema.post("remove",function (problem) {
    fileManager.removeDirectory(this.dir);
});

module.exports = mongoose.model("Problem", ProblemSchema);
