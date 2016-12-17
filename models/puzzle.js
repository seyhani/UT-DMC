var mongoose = require("mongoose");

var PuzzleSchema = new mongoose.Schema({
    problem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem"
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
    },
    submitImg: {data: Buffer, contentType: String}, //TODO: to save file
    tags:[String],
    lastSubmit:{type:Date,default:Date.now()-60000},
    status: String
});

PuzzleSchema.methods.hasTag = function (tag) {
    return (this.tags.indexOf(tag) != -1);
};

PuzzleSchema.virtual('feedback').get(function (){
    return this.problem.getFeedback(this.group.index);
});

PuzzleSchema.methods.submitAnswer = function (answer) {
    this.lastSubmit = Date.now();
    var answers = this.problem.answer.split(" ");
    var correctAnswer;
    if(answers.length > 1)
        correctAnswer = answers[this.group.index%answers.length];
    else
        correctAnswer = this.problem.answer;
    if(answer == correctAnswer) {
        this.status = 'solved';
        this.problem.submits.correct++;
        // this.group.competition.score++;
    }else{
        this.problem.submits.wrong++;
    }
    this.problem.save();
    this.save();

    return answer == correctAnswer;
};

PuzzleSchema.methods.requsetForHint = function () {
    if(this.group.competition.hints < 1)
        return false;
    this.group.competition.hints--;
    this.status = "requestedForHint";
    this.save();
    return true;
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
