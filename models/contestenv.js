var mongoose = require("mongoose");
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var ContestEnvSchema = new mongoose.Schema({
    name:String,
    agents:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Agent"
    }],
    contest:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contest"
    }
});


ContestEnvSchema.plugin(deepPopulate);

module.exports = mongoose.model("ContestEnv", ContestEnvSchema);