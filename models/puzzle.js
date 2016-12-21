var mongoose = require("mongoose");
//Puzzle status
//new -> sold -> submitted -> rejected
//                         -> accepted
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
    lastSubmit:{type:Date,default:Date.now()-60000},
    status: {type:String,default:"new"},
    submisson:{
        file:String,
        answer:String,
    }
});

PuzzleSchema.methods.hasTag = function (tag) {
    return (this.tags.indexOf(tag) != -1);
};

PuzzleSchema.virtual('feedback').get(function (){
    return this.problem.getFeedback(this.group.index);
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

PuzzleSchema.virtual('cost').get(function () {
    return this.problem.score/2 ;
});

PuzzleSchema.virtual('requestedForHint').get(function () {
    return  this.status == "requestedForHint";
});

module.exports = mongoose.model("Puzzle", PuzzleSchema);
