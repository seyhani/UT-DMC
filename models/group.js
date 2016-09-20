var mongoose = require("mongoose");

var GroupSchema = new mongoose.Schema({
    name:String,
    members:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    membershipToken:{secret:String,expireTime:Date},
    competition:{
        stage:{type:Number,default:0},
        score:{type:Number,default:0},
        solvedProblems:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Problem"
        }],
    }
});

GroupSchema.methods.solved  = function (problem) {
   return this.competition.solvedProblems.indexOf(problem) != -1;
};

GroupSchema.methods.addMember = function (user) {
    if(this.members.indexOf(user._id)==-1)
        this.members.push(user);
    user.group = this;
    user.groupname = this.name;
    user.save();
    this.save();
};
module.exports = mongoose.model("Group", GroupSchema);