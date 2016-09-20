var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    firstname:String,
    lastname:String,
    email:String,
    username: String,
    password: String,
    groupname:String,
    group:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
    },
});
UserSchema.virtual("isAdmin").get(function () {
   return (this.username == "a");
});
UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", UserSchema);