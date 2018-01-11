let mongoose = require("mongoose");
let deepPopulate = require('mongoose-deep-populate')(mongoose);

let CompetitionSchema = new mongoose.Schema({
    name:String,
    score:{type:Number,default:0},
    hints:{type:Number,default:5},
    puzzles:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Puzzle"
    }]
});

CompetitionSchema.plugin(deepPopulate);

CompetitionSchema.methods.getProblemIds = function() {
  let competition = this;
  return new Promise((resolve,reject) => {
    mongoose.model('Competition').aggregate([
      {
        $match:{
          _id:competition._id
        }
      },
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
      }
    ],function(err, competitions) {
      if(err)
        reject(err);
      else
        resolve(competitions);
    });
  });
};

module.exports = mongoose.model("Competition", CompetitionSchema);