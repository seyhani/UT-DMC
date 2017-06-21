var mongoose = require('mongoose'),
    _ = require('lodash');

var fs = require('fs');
var rimraf = require('rimraf');
let tempDirectory = "./temp/";
const path = require('path');

exports.writeToFile = function (filePath,data) {
    return new Promise((resolve,reject) => {
        fs.writeFile(filePath,data,resolve());
    });
};
exports.removeFile = function (path) {
    return new Promise((resolve,reject) => {
        if (fs.existsSync(path))
            fs.unlinkSync(path);
        resolve();
    });
};
exports.removeDirectory = function (path) {
    return new Promise((resolve,reject) => {
        rimraf(path,resolve);
    });
};
exports.makeDirectory = function (path) {
    return new Promise((resolve,reject) => {
        if (!fs.existsSync(path)){
            fs.mkdirSync(path);
        }
        resolve();
    });
};
exports.readAllFilesFromDir = function (dir) {
    var filesystem = require("fs");
    var results = [];
    filesystem.readdirSync(dir).forEach(function(file){
        file = dir+'/'+file;
        var stat = filesystem.statSync(file);

        if (stat && stat.isDirectory()) {
            results = results.concat(_getAllFilesFromFolder(file))
        } else results.push(file.replace("public/",""));

    });

    return results;

};
exports.deleteDirectoryRecursive = function (path) {
    if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};
function copyFile(source_path, dest_path) {
    return new Promise((resolve,reject) => {
        var readStream = fs.createReadStream(source_path);
        var writeStream = fs.createWriteStream(dest_path);
        readStream.pipe(writeStream);
        readStream.on('end',function () {
            resolve();
        })
    });
}
exports.copyFile = copyFile;

exports.copyFileToDir = function (source_path,dest_directory,dest_file_name)  {
    var dest_path =  dest_directory + '/' + dest_file_name;
    return copyFile(source_path,dest_path);
};

exports.moveFile = function (source_path,dest_path)  {
    return new Promise((resolve,reject) => {
        fs.rename(source_path, dest_path, function (err) {
            fs.unlink(source_path, function () {
                resolve();
            });
        });
    });
};

exports.moveFileToDir = function (source_path,dest_directory,dest_file_name)  {
    return new Promise((resolve,reject) => {
        var dest_path = dest_directory + "/" + dest_file_name;
        fs.rename(source_path, dest_path, function (err) {
            fs.unlink(source_path, function () {
                resolve();
            });
        });
    });
};

