var mongoose = require("mongoose");

var ProblemSchema = new mongoose.Schema({
    name: String,
    description:String,
    files:[String],
    answer:String,
    tags:[String],
    score:Number,
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
}

ProblemSchema.methods.submitAnswer = function (answer) {
    return (answer == this.answer);
}

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



module.exports = mongoose.model("Problem", ProblemSchema);

