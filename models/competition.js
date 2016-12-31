var mongoose = require("mongoose");
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var CompetitionSchema = new mongoose.Schema({
    name:String,
    score:{type:Number,default:0},
    hints:{type:Number,default:5},
    puzzles:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Puzzle"
    }]
});

CompetitionSchema.plugin(deepPopulate);

module.exports = mongoose.model("Competition", CompetitionSchema);