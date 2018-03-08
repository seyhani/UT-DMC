'use strict';

var mongoose = require("mongoose");
var ObjectId = require('mongoose').Types.ObjectId;

var ClarSchema = new mongoose.Schema({
    text: String,
    from: String,
    to: String,
    date: Date,
    toAll: {type: Boolean, default: false}
});

module.exports = mongoose.model("Clar", ClarSchema);