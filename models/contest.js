var mongoose = require("mongoose");
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var ContestSchema = new mongoose.Schema({
    name:String,
    stage:{type:Number,default:0},
    hints:{type:Number,default:5},
    Problems:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem"
    }]
});
ContestSchema.virtual('score').get(function () {
    var score = 0;
    this.puzzles.forEach(function (puzzle) {
        if(puzzle.accepted)
            score += puzzle.score;
    });
    return score;
});


ContestSchema.plugin(deepPopulate);

module.exports = mongoose.model("Contest", ContestSchema);