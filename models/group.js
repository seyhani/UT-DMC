var mongoose = require("mongoose");
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var GroupSchema = new mongoose.Schema({
    name:String,
    index:Number,
    credit:{type:Number,default:0},
    members:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    solvedProblems:[{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem"
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

GroupSchema.methods.view= function (puzzle) {
    if(!puzzle)
        return false;
    if(!puzzle.new)
        return true;
    if(this.credit  >= puzzle.cost) {
        this.credit -= puzzle.cost;
        puzzle.status = "sold";
        puzzle.save();
        this.save();
        return true;
    }
    return false;

};

GroupSchema.virtual('score').get(function () {
    return this.competition.score;
});

GroupSchema.pre("remove",function (next) {
    let group = this;
    mongoose.model("Puzzle").remove({group:group},function (err) {next();});
});

GroupSchema.statics.findByPuzzles = function() {
  mongoose.model("Group").aggregate([
    {
      $lookup:{
        from:'competition',
        localField:'competition',
        foreignField:'_id',
        as:'competition'
      }
    }
  ],function(err, groups) {
    console.log(groups);
  });
};

GroupSchema.statics.getByProblemId = function(problemId){
  return new Promise((resolve,reject) => {
    mongoose.model('Competition').aggregate([
      {
        $unwind: '$puzzles'
      },
      {
        $lookup:{
          from:'puzzles',
          localField:'puzzles',
          foreignField:'_id',
          as:'puzzles'
        }
      },
      {
        $project:{
          '_id':1,
          'puzzles.problem':1
        }
      },
      {
        $unwind:'$puzzles'
      },
      {
        $group:{
          _id:'$_id',
          problems:{
            $addToSet:'$puzzles.problem'
          }
        }
      },
      {
        $unwind:'$problems'
      },
      {
        $match:{
          problems:problemId
        }
      },
      {
        $group:{
          _id:'$_id',
        }
      },
      //{
      //  $lookup:{
      //    from:'groups',
      //    localField:'_id',
      //    foreignField:'competition',
      //    as:'group'
      //  }
      //},
      //{
      //  $unwind:'$group'
      //},
      //{
      //  $project:{
      //    _id:'$group._id',
      //    name:'$group.name'
      //  }
      //},
      //{
      //
      //}
    ],function(err, competitions) {
      mongoose.model('Group').find({competition:{$nin:competitions}}).exec(function(err, groups) {
        if(err)
          reject(err);
        else
          resolve(groups);
      });
    });
  });
};

GroupSchema.plugin(deepPopulate);

module.exports = mongoose.model("Group", GroupSchema);
