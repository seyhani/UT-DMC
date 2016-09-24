var mongoose = require("mongoose");
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var GroupSchema = new mongoose.Schema({
    name:String,
    index:Number,
    members:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    competition:{
        stage:{type:Number,default:0},
        score:{type:Number,default:0},
        hints:{type:Number,default:5},
        puzzles:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Puzzle"
        }],
    }
});

GroupSchema.methods.findCurrentStagePuzzles = function (callback) {
    var group = this;
    mongoose.model("Puzzle").find({$and:[{tags:group.competition.stage},{_id:{$in:group.competition.puzzles}}]})
        .populate("problem").exec(callback);
};

GroupSchema.methods.findCurrentStageMetaPuzzle = function (callback) {
    var group = this;
    mongoose.model("Puzzle").findOne({$and:[{tags:"meta"+group.competition.stage},{_id:{$in:group.competition.puzzles}}]})
        .populate("problem").exec(callback);
};

GroupSchema.methods.addMember = function (user) {
    if(this.members.indexOf(user._id)==-1)
        this.members.push(user);
    user.group = this;
    user.groupname = this.name;
    user.save();
    this.save();
};

GroupSchema.methods.addPuzzle = function (puzzle) {
    this.competition.puzzles.push(puzzle);
    this.competition.save();
};

GroupSchema.plugin(deepPopulate);

module.exports = mongoose.model("Group", GroupSchema);