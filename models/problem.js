var mongoose = require("mongoose");

var ProblemSchema = new mongoose.Schema({
    name: String,
    description:String,
    files:[String],
    solution:{answer:String,files:[String]},
});

module.exports = mongoose.model("Problem", ProblemSchema);

