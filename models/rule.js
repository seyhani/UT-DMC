var mongoose = require("mongoose");
var middleware = require("../middleware/index");

var RuleSchema = new mongoose.Schema({
    name:String,
    startDate:Date,
    duration:Number,
    submissonsTime:Number,
    paybackFactor:Number,
    creditFactor:Number
});

module.exports = mongoose.model("Rule", RuleSchema);
