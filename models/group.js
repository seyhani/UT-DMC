var mongoose = require("mongoose");
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var GroupSchema = new mongoose.Schema({
    name:String,
    index:Number,
    credit:{type:Number,default:0},
    socre:{type:Number,default:0},
    initalCredit:{type:Number,default:0},
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

GroupSchema.methods.view= function (puzzle) {
    var group = this;
    return new Promise((resolve,reject) => {
        this.calculateCredit().then(function (credit) {
            if(!puzzle || !puzzle.new ||puzzle.accepted)
                resolve(true);
            else if(credit  >= puzzle.cost) {
                puzzle.status = "sold";
                puzzle.save();
                group.save();
                resolve(true);
            }
            resolve(false);
        });
    });
};

GroupSchema.pre("remove",function (next) {
    var group = this;
    mongoose.model("Puzzle").remove({group:group},function (err) {next();});
});

GroupSchema.methods.calculateScore = function () {
    var group = this;
    return new Promise((resolve,reject) => {
        mongoose.model("Puzzle").aggregate(
            [
                {
                    $match:{
                        group: mongoose.Types.ObjectId(group._id),
                        status: "accepted"
                    }
                },

                {
                    $lookup:{
                        from: "problems",
                        localField: "problem",
                        foreignField: "_id",
                        as: "problem"
                    }
                },

                {
                    $project:{
                        score:{$arrayElemAt:["$problem.score",0]},
                        group: 1
                    }
                },

                {
                    $group: {
                        _id:"$group",
                        score:{$sum:"$score"}
                    }
                }

            ],function (err,result) {
                var s = 0;
                if(result) {
                    if (result.length > 0)
                        s = result[0].score;
                }
                resolve(s);
            });
    });
};

GroupSchema.methods.calculateCredit = function () {
    var group = this;
    return new Promise((resolve,reject) => {
        mongoose.model("Puzzle").aggregate(
            [
                {
                    $match:{
                        group: mongoose.Types.ObjectId(group._id)
                    }
                },

                {
                    $lookup:{
                        from: "problems",
                        localField: "problem",
                        foreignField: "_id",
                        as: "problem"
                    }
                },

                {
                    $project:{
                        payback:{$divide:[{$arrayElemAt:["$problem.score",0]},2]},
                        group: 1,
                        status:1
                    }
                },

                {
                    $group: {
                        _id: "$group",
                        cr: {
                            $sum: {
                                $cond: {
                                    if: {$eq: ["$status", "accepted"]}, then:{$multiply:["$payback",1]},
                                    else: {
                                        $cond: {
                                            if: {$ne: ["$status", "new"]}, then:{$multiply:["$payback",-1]},
                                            else: 0
                                        }

                                    }
                                }

                            }
                        }
                    }
                }

            ],function (err,result) {
                var payment = 0;
                if(result) {
                    if (result.length > 0)
                        payment = result[0].cr;
                }
                resolve(payment + group.initalCredit);
            });
    });
};

GroupSchema.statics.findById = function (id) {
    return new Promise((resolve,reject) => {
        mongoose.model("Group").findOne({_id:id}).deepPopulate(['members','competition.puzzles','competition.puzzles.problem'])
            .exec(function (err,group) {
                if(group)
                {
                    group.calculateCredit().then(function (credit) {
                        group.calculateScore().then(function (score) {
                            group.score = score;
                            group.credit = credit;
                            group.save();
                            resolve(group);
                        })
                    });
                }
                else{
                    reject(err);
                }
            });
    });
};

GroupSchema.plugin(deepPopulate);

module.exports = mongoose.model("Group", GroupSchema);
