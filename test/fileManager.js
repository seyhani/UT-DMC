let fileManager = require("../middleware/fileManager"),
    assert      = require('assert'),
    rimraf      = require('rimraf'),
    async       = require('async'),
    Problem      = require('../models/problem'),
    Puzzle      = require('../models/puzzle');
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/DMC");
process.on("unhandledRejection",function () {});
describe('file manager', function() {
    it('Cache puzzle files', function(done) {

    });
});