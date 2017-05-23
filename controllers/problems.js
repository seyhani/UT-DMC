var mongoose = require('mongoose'),
    _ = require('lodash');

var Grid = require('gridfs-stream');
var fs = require('fs');
Grid.mongo = mongoose.mongo;
var gfs = new Grid(mongoose.connection.db);
var fileManager = require("../middleWare/file");
var Problem = require("../models/problem");

exports.index = function (req,res,next) {

};

exports.show = function (req,res,next) {
    var problemId = req.params.problemId;

    // Problem.findById(problemId).exec(function (err,problem) {
    //     fileManager.downloadFileFromMongo(problem.files[0],function (file) {
    //         res.writeHead(200, {'Content-Type': file.contentType});
    //         var fstream = fs.createWriteStream("./temp/my.jpg");
    //         var readstream = gfs.createReadStream({
    //             _id: file._id
    //         });
    //         readstream.pipe(fstream);
    //         readstream.on('data', function (data) {
    //             res.write(data);
    //         });
    //
    //         readstream.on('end', function () {
    //             res.end();
    //         });
    //
    //         readstream.on('error', function (err) {
    //             console.log('An error occurred!', err);
    //             throw err;
    //         });
    //     });
    // });
};

exports.new = function (req,res,next) {

};

exports.create = function (req,res,next) {

    var problemName = req.body.problemName;
    var problemDescription = req.body.problemDescription;
    Problem.create({name:problemName,description:problemDescription,files:[],judge:{}},function (err,newProblem) {
        return res.status(200).send({
            message: 'Success'
        });
    });
};

exports.upload = function (req,res,next) {
    var file = req.files["file"];
    var problem = req.problem;
    problem.addFile(file,function () {
        return res.status(200).send({
            message: 'Success'
        });
    })
};

exports.addInputFile = function (req,res,next) {
    var file = req.files["file"];
    var problem = req.problem;
    problem.addInputFile(file,function () {
        return res.status(200).send({
            message: 'Success'
        });
    })
};

exports.addOutputFile = function (req,res,next) {
    var file = req.files["file"];
    var problem = req.problem;
    problem.addOutputFile(file,function () {
        return res.status(200).send({
            message: 'Success'
        });
    })
};

exports.addTesterFile = function (req,res,next) {
    var file = req.files["file"];
    var problem = req.problem;
    problem.addTesterFile(file,function () {
        return res.status(200).send({
            message: 'Success'
        });
    })
};

exports.edit = function (req,res,next) {

};

exports.update = function (req,res,next) {

};

exports.destroy = function (req,res,next) {

};

exports.problemById = function (req,res,next) {
    var problemId = req.params.problemId;
    Problem.findById(problemId).exec(function (err,problem) {
        problem.cacheJudgeFiles();
        req.problem = problem;
        next();
    });
};
