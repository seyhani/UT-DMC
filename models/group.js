var mongoose = require("mongoose");

var GroupSchema = new mongoose.Schema({
    name:String,
    members:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    membershipToken:{secret:String,expireTime:Date},
    score:{type:Number,default:0}
});

GroupSchema.methods.addMember = function (user) {
    if(this.members.indexOf(user._id)==-1)
        this.members.push(user);
    user.group = this;
    user.save();
    this.save();
    console.log(user);
    console.log(this);
};
module.exports = mongoose.model("Group", GroupSchema);