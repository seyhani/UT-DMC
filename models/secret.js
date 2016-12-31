var mongoose = require("mongoose");

var SecretSchema = mongoose.Schema({
    token: {type:String,verified:Boolean},
});

module.exprots = mongoose.model("Secret", SecretSchema);