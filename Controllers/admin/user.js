var express = require('express');
var User = require("../../../models/user");
var passport = require("passport");
var rimraf = require("rimraf");
var mongoose = require("mongoose");


//INDEX
exports.index=  function(req, res) {
    User.find({},function (err,users) {
        res.render('admin/user/index',{users:users});
    });
};

//SHOW
exports.show  = function(req, res) {
    var user = req.user;
    res.render('admin/user/view',{user:user});
};

//CREATE
exports.create =  function(req, res) {
    var user = req.user;
    res.render('dashboard/profile/edit',{user:user});
};

//NEW
exports.new =  function(req, res) {
    var new_data = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        address: req.body.address,
        phone: req.body.phone,
        image: req.body.image
    };
    User.findByIdAndUpdate(req.user._id,{$set:new_data},function (err,user) {
        res.redirect("/admin/"+req.user._id );
    });
};

//EDIT
exports.edit = function(req, res) {
    var user = req.user;
    user.remove(function (err) {
        if(err)
            return res.status(400).send({message:err.message});
        else
            res.redirect("/admin/users" );
    });
};

//UPDATE
exports.update = function (req, res, next, id) {
    if(!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).send({message:"Id is not valid!"});
    User.findById(id).exec(function (err,user) {
        if(err)
            return res.status(404).send({message:"User not found!"});
        req.user = user;
        next();
    });
};

//DESTROY
exports.delete = function (req, res, next, id) {
    if(!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).send({message:"Id is not valid!"});
    User.findById(id).exec(function (err,user) {
        if(err)
            return res.status(404).send({message:"User not found!"});
        req.user = user;
        next();
    });
};