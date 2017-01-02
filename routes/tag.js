var express = require("express");
var router  = express.Router();
var Tag = require("../models/tag");
var middleware = require("../middleware");
var request = require("request");
var multer = require('multer');
var rimraf = require('rimraf');
var fs = require("fs");
var upload = multer({
    dest: './Uploads/',
    onFileUploadComplete: function (file) {
        console.log(file.fieldname + ' uploaded to  ' + file.path)
    }
});
var fs = require("fs");

router.all("/*",middleware.isAdminLoggedIn,middleware.havePermission);

router.get("/", function(req, res){
    Tag.find({}, function(err, alltags) {
        if (err) {
            console.log(err);
        } else {
            res.render("admin/tag", {tags: alltags});
        }
    });
});

//CREATE - add new tag to DB
router.post("/",function(req, res){
    var tag =new Tag( {title: req.body.tagTitle});
    Tag.findOne({title:tag.title}).exec(function (err,foundtag) {
        if(!foundtag) {
            if (err) {
                req.flash("error", err.message);
                middleware.dmcRedirect(res,"back");
            } else {
                tag.save();
                req.flash("success", "Successfully Added!");
                middleware.dmcRedirect(res,"/admin/tags");
            }
        }else{
            req.flash("error", "tag already exist!");
            middleware.dmcRedirect(res,"/admin/tags/");
        }
    });
});

router.post('/:tag_id', function(req, res,next) {
    Tag.findById(req.params.tag_id,function (err,tag) {
        if(err) return next(err);
        tag.tag = req.body.tag;
        middleware.dmcRedirect(res,"/admin/tags/");
    });
});

router.delete("/:tag_id",function(req, res,next){
    var tag_id = req.params.tag_id;
    Tag.findOne({'_id':req.params.tag_id}).exec(function(err,tag) {
        if(err) return next(err);
        tag.remove();
        req.flash("success"," Successfully deleted!");
        middleware.dmcRedirect(res,"/admin/tags");
    });
});

module.exports = router;
