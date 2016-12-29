var mongoose = require("mongoose");
var middleware = require("../middleware/index");

var ProblemSchema = new mongoose.Schema({
    name: String,
    description:String,
    type:String,
    score:Number,
    isHidden:Boolean,
    tags:[String],
    files:{
        source:[String],
        input:[String],
        output:[String]
    }
});


module.exports = mongoose.model("Problem", ProblemSchema);

