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
            type: mongoose.Schema.Types.ObjectId,
            ref: "Competition"
        },
});

GroupSchema.methods.findCurrentStagePuzzles = function (callback) {
    var group = this;
    mongoose.model("Puzzle").find({_id:{$in:group.competition.puzzles}})
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

GroupSchema.pre("remove",function (next) {
    var group = this;
    mongoose.model("Puzzle").remove({group:group},function (err) {group.competition.remove();next();});
});

GroupSchema.plugin(deepPopulate);

module.exports = mongoose.model("Group", GroupSchema);