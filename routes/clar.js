'use strict';

const express = require("express");
const router  = express.Router();
const Clar = require("../models/clar");
const middleware = require("../middleware/index");
const User = require("../models/user");
const Group = require("../models/group");

router.all("/clar/*",middleware.isLoggedIn);
router.all("/clar/admin/*",middleware.isAdminLoggedIn,middleware.havePermission);

router.get("/", function(req, res){
	if(req.user && req.user.group){
		Clar.find({$or:[{from: req.user.group.name}, {to: req.user.group.name}, {toAll: true}]}, function(err, clars){
			if(err) console.log("Err @ clar:" + err);
			res.render("clar", {clars: clars});
		});
	}else{
		Clar.find({toAll: true}, function(err, clars){
			if(err) console.log("Err @ clar:" + err);
			res.render("clar", {clars: clars});
		});
	}
});

router.get("/admin", function(req, res){
	if(req.user && req.user.isAdmin){
		Clar.find({}, function(err, clars){
			if(err) console.log("Err @ clar:" + err);
			res.render("clar", {clars: clars});
		});
	}else{
		req.flash("error", "err");
		middleware.dmcRedirect(res, "/");
	}
});

router.get("/admin/all", function(req, res){
	if(req.user && req.user.isAdmin){
		Clar.find({toAll: true}, function(err, clars){
			if(err) console.log("Err @ clar:" + err);
			res.render("clarAll", {clars: clars});
		});
	}else{
		req.flash("error", "err");
		middleware.dmcRedirect(res, "/");
	}
});

router.post("/", function(req, res){
	if(req.user && req.user.group){
		User.findById(req.user._id).populate("group").exec(function(err,user){
			var clar = new Clar({text: req.body.text, from: user.group.name, to: "Admin", date: new Date(Date.now()), toAll: false});
			clar.save(function(err){
				if(err) console.log("Err @ clar:" + err);
				middleware.dmcRedirect(res, "/clar/");
			});
		});
	}else{
		req.flash("error", "شما گروه ندارید.");
		middleware.dmcRedirect(res, "/");
	}
});

router.post("/admin", function(req, res){
	if(req.user && req.user.isAdmin){
		User.findById(req.user._id).populate("group").exec(function(err,user){
			var clar = new Clar({text: req.body.text, from: "Admin", to: req.body.to, date: new Date(Date.now())});
			clar.save(function(err){
				if(err) console.log("Err @ clar:" + err);
				middleware.dmcRedirect(res, "/clar/admin");
			});
		});
	}else{
		req.flash("error", "err");
		middleware.dmcRedirect(res, "/");
	}
});

router.post("/admin/all", function(req, res){
	if(req.user && req.user.isAdmin){
		User.findById(req.user._id).populate("group").exec(function(err,user){
			var clar = new Clar({text: req.body.text, from: "Admin", to: "All", date: new Date(Date.now()), toAll: true});
			clar.save(function(err){
				if(err) console.log("Err @ clar:" + err);
				middleware.dmcRedirect(res, "/clar/admin/all");
			});
		});
	}else{
		req.flash("error", "err");
		middleware.dmcRedirect(res, "/");
	}
});

module.exports = router;
