var mongoose = require("mongoose");
var middleware = require("../middleware/index");

var TagSchema = new mongoose.Schema({
    title:String,
    tags:[String]
});

TagSchema.virtual('tag').set(function (tag) {
    var superTag = this;
    var foundtag = superTag.tags.find(function (t) {
        return t == tag;
    });
    if(foundtag) {
        superTag.tags.splice(superTag.tags.indexOf(foundtag),1);
        superTag.save();
    }else{
        superTag.tags.push(tag);
        superTag.save();
    }
});

module.exports = mongoose.model("Tag", TagSchema);
