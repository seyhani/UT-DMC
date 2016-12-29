var mongoose = require("mongoose");
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var GroupSchema = new mongoose.Schema({
    name:String,

    users:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    agent:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Agent"
    },

    contestRecord:[{
        name: String,
        date: Date,
        submissons:{
            status:String,
            solution:String,
            date:Date,
            problem :{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Problem"
            }
        }
    }],

    invitation:{
        Token:String,
        ExpiresAt:Date
    },
});

GroupSchema.plugin(deepPopulate);

module.exports = mongoose.model("Group", GroupSchema);