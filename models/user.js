var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    group:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
    },
});
UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", UserSchema);