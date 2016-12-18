var mongoose = require("mongoose");
var middleware = require("../middleware/index");

var ProblemSchema = new mongoose.Schema({
    name: String,
    description:String,
    files:[String],
    answer:String,
    tags:[String],
    score:Number,
    feedback:String,
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

ProblemSchema.methods.getFeedback = function (group_id) {
    var feedback;
    var feedbacks = this.feedback.split(" ");
    if(feedbacks.length > 1)
        feedback = feedbacks[group_id%feedbacks.length];
    else
        feedback = feedbacks;
    return feedback;
};

ProblemSchema.methods.submitAnswer = function (answer) {
    var answers = this.answer.split(" ");
    if(answers.length==1)
        return (answer == this.answer);
    else {

    }
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
    return "Files/Problems/"+this.name+"/";
});

ProblemSchema.post("remove",function (problem) {
    middleware.removeProblemDirectories(problem.name);
});

module.exports = mongoose.model("Problem", ProblemSchema);

