var mongoose = require("mongoose");
var middleware = require("../middleware/index");

var SubmissionSchema = new mongoose.Schema({
    status:String,
    solution:String,
    date:Date,
    problem:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem"
    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Agent"
    }
});


module.exports = mongoose.model("Submission", SubmissionSchema);

