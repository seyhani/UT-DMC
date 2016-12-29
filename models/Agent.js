var mongoose = require("mongoose");
var middleware = require("../middleware/index");
var deepPopulate = require('mongoose-deep-populate')(mongoose);
//Agent status
//new -> sold -> submitted -> rejected
//                         -> accepted
var AgentSchema = new mongoose.Schema({
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
    },
    contestenv: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ContestEnv"
    },
});

module.exports = mongoose.model("Agent", AgentSchema);
