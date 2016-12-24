var mongoose = require("mongoose");
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var CompetitionSchema = new mongoose.Schema({
    name:String,
    stage:{type:Number,default:0},
    hints:{type:Number,default:5},
    puzzles:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Puzzle"
    }]
});
CompetitionSchema.virtual('score').get(function () {
    var score = 0;
    this.puzzles.forEach(function (puzzle) {
        if(puzzle.accepted)
            score += puzzle.score;
    });
    return score;
});


CompetitionSchema.plugin(deepPopulate);

module.exports = mongoose.model("Competition", CompetitionSchema);