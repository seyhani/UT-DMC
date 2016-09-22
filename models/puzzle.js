var mongoose = require("mongoose");

var PuzzleSchema = new mongoose.Schema({
    problem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem"
    },
    tags:[String],
    lastSubmit:{type:Date,default:Date.now()-60000},
    status: String
});

PuzzleSchema.methods.hasTag = function (tag) {
    return (this.tags.indexOf(tag) != -1);
};

PuzzleSchema.methods.submitAnswer = function (answer) {
    this.lastSubmit = Date.now();
    var correctAnswer = this.problem.submitAnswer(answer); 
    if(correctAnswer) {
        this.status = 'solved';
        this.problem.submits.correct++;
    }else{
        this.problem.submits.wrong++;
    }
    this.problem.save();
    this.save();

    return correctAnswer;
};

PuzzleSchema.virtual('reviewd').get(function () {
    return this.status == 'reviewd';
});

PuzzleSchema.virtual('name').get(function () {
    return this.problem.name;
});

PuzzleSchema.virtual('solved').get(function () {
    return this.status == 'solved';
});

PuzzleSchema.virtual('requestedForHint').get(function () {
    return  this.status == "requestedForHint";
});

module.exports = mongoose.model("Puzzle", PuzzleSchema);

