'use strict';
var mongoose = require("mongoose");
var ObjectId = require('mongoose').Types.ObjectId;

var ClarificationSchema = new mongoose.Schema({
    text : String,
    author : String,
    inReplyTo: String
});

module.exports = mongoose.model("Clarification", ClarificationSchema);
